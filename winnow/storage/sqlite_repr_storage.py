import logging
import os
from uuid import uuid4 as uuid

import numpy as np
from sqlalchemy import Column, String, Integer, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base

from db import Database

# Logger used in representation-storage module
logger = logging.getLogger(__name__)

# Base-class for database entities
Base = declarative_base()


class FeatureFile(Base):
    """A file containing some representation of source video file."""

    __tablename__ = 'feature_files'
    __table_args__ = (UniqueConstraint('source_path', 'source_sha256', name='_file_uc'),)

    id = Column(Integer, primary_key=True)
    source_path = Column(String)  # source video-file path
    source_sha256 = Column(String)  # source video-file hash
    feature_file_path = Column(String)  # path to the file containing the feature


class SQLiteReprStorage:
    """SQLite-based persistent storage of a single type of intermediate representation.

    For each type of intermediate representation you should create separate instance of this storage.
    """

    # The storage is implemented as follows:
    #   * All information is stored in some user-specified directory.
    #   * SQLite database file is created at the root of the storage directory.
    #   * For each saved representation there is a file containing the representation value in the storage directory.
    #   * For each saved representation there is database record matching source file's (path,sha256), feature-type and
    #     the name of the file containing the corresponding representation value.

    def __init__(self, directory, save=np.save, load=np.load, suffix="_vgg_features.npy"):
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

    def exists(self, path, sha256):
        """Check if the file has the representation."""
        with self.database.session_scope() as session:
            return self._exists(session, path, sha256)

    def read(self, path, sha256):
        """Read file's representation."""
        with self.database.session_scope() as session:
            record = self._record(session, path, sha256).one()
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            return self._load(feature_file_path)

    def write(self, path, sha256, value):
        """Write the representation for the given file."""
        with self.database.session_scope() as session:
            record = self._get_or_create(session, path, sha256)
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            self._save(feature_file_path, value)

    def delete(self, path, sha256):
        """Delete representation for the file."""
        with self.database.session_scope() as session:
            record = self._record(session, path, sha256).one()
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            os.remove(feature_file_path)
            session.delete(record)

    def list(self):
        """Iterate over all (path,sha256) pairs that already have this representation."""
        with self.database.session_scope() as session:
            for record in session.query(FeatureFile):
                yield record.source_path, record.source_sha256

    # Private methods

    @staticmethod
    def _record(session, path, sha256):
        """Shortcut for querying record for the given feature-file."""
        return session.query(FeatureFile).filter(
            FeatureFile.source_path == path,
            FeatureFile.source_sha256 == sha256,
        )

    @staticmethod
    def _exists(session, path, sha256):
        """Shortcut for checking record presence."""
        return session.query(FeatureFile.id).filter(
            FeatureFile.source_path == path,
            FeatureFile.source_sha256 == sha256,
        ).scalar() is not None

    def _get_or_create(self, session, path, sha256):
        """Get feature-file record, create one with unique name if not exist."""
        feature_file = SQLiteReprStorage._record(session, path, sha256).first()
        if feature_file is not None:
            return feature_file
        # Create a missing feature-file with unique path.
        feature_file = FeatureFile(
            source_path=path,
            source_sha256=sha256,
            feature_file_path=f"{uuid()}{self._suffix}")
        session.add(feature_file)
        return feature_file
