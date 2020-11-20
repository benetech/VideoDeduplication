import logging
import os
from uuid import uuid4 as uuid

import numpy as np
from sqlalchemy import Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base

from db import Database
from winnow.storage.repr_key import ReprKey

# Logger used in representation-storage module
logger = logging.getLogger(__name__)

# Base-class for database entities
Base = declarative_base()


class FeatureFile(Base):
    """A file containing some representation of source video file."""

    __tablename__ = 'feature_files'

    id = Column(Integer, primary_key=True)
    source_path = Column(String, unique=True)  # source video-file path relative to dataset root directory
    hash = Column(String)  # original file hash (e.g. sha256)
    tag = Column(String)  # metadata tags as JSON
    feature_file_path = Column(String)  # path to the file containing the feature

    def to_key(self):
        """Convert database record to ReprKey."""
        return ReprKey(path=self.source_path, hash=self.hash, tag=self.tag)


class SQLiteReprStorage:
    """SQLite-based persistent storage for intermediate representations.

    For each dataset file path there is a single entry in the storage.
    Each entry is associated with the file hash and configuration tag.

    The purpose of the file hash is to guarantee that whenever original
    file content changes the client must be able to detect that to update
    the stored representation value.

    Configuration tag purpose is to guarantee that whenever pipeline
    configuration is changed the clint code must be able to detect that
    to update the stored representation value.

    It is responsibility of client code to make sure that incompatible
    pipeline configurations have different key tags.
    """

    # The storage is implemented as follows:
    #   * All information is stored in some user-specified directory.
    #   * SQLite database file is created at the root of the storage directory.
    #   * For each saved representation there is a file containing the representation value in the storage directory.
    #   * For each saved representation there is database record matching source file's (path,hash,tag), and
    #     the name of the file containing the corresponding representation value.

    def __init__(self, directory, save=np.save, load=np.load, suffix=".npy"):
        """Create new storage instance.

        Args:
            directory (String): Path to the directory in which representations are stored.
            save (Function): Function to write representation value to the file.
            load (Function): Function to load representation value from file.
        """
        self.directory = os.path.abspath(directory)
        self._save = save
        self._load = load
        self._suffix = suffix

        if not os.path.exists(directory):
            logger.info("Creating intermediate representation directory: %s", self.directory)
            os.makedirs(self.directory)

        self.db_file = os.path.join(self.directory, "repr.sqlite")
        self.database = Database(f"sqlite:///{self.db_file}", base=Base)
        self.database.create_tables()

    def exists(self, key: ReprKey):
        """Check if the representation exists."""
        with self.database.session_scope() as session:
            return self._exists(session, key)

    def read(self, key: ReprKey):
        """Read file's representation."""
        with self.database.session_scope() as session:
            record = self._record(session, key).one_or_none()
            if record is None:
                raise KeyError(repr(key))
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            return self._load(feature_file_path)

    def write(self, key: ReprKey, value):
        """Write the representation for the given file."""
        with self.database.session_scope() as session:
            record = self._get_or_create(session, key.path)
            record.hash = key.hash
            record.tag = key.tag
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            self._save(feature_file_path, value)

    def delete(self, path):
        """Delete representation for the file."""
        with self.database.session_scope() as session:
            record = session.query(FeatureFile).filter(FeatureFile.source_path == path).one_or_none()
            if record is None:
                raise KeyError(path)
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            os.remove(feature_file_path)
            session.delete(record)

    def list(self):
        """Iterate over all storage keys."""
        with self.database.session_scope() as session:
            for record in session.query(FeatureFile):
                yield record.to_key()

    # Private methods

    @staticmethod
    def _record(session, key: ReprKey):
        """Shortcut for querying record for the given feature-file."""
        return session.query(FeatureFile).filter(
            FeatureFile.source_path == key.path,
            FeatureFile.hash == key.hash,
            FeatureFile.tag == key.tag,
        )

    @staticmethod
    def _exists(session, key: ReprKey):
        """Shortcut for checking record presence."""
        return session.query(FeatureFile.id).filter(
            FeatureFile.source_path == key.path,
            FeatureFile.hash == key.hash,
            FeatureFile.tag == key.tag,
        ).scalar() is not None

    def _get_or_create(self, session, path):
        """Get feature-file record, create one with unique name if not exist."""
        feature_file = session.query(FeatureFile).filter(FeatureFile.source_path == path).one_or_none()
        if feature_file is not None:
            return feature_file
        # Create a missing feature-file with unique path.
        feature_file = FeatureFile(
            source_path=path,
            feature_file_path=f"{uuid()}{self._suffix}")
        session.add(feature_file)
        return feature_file
