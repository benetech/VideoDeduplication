import json
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
    source_path = Column(String)  # source video-file path relative to dataset root directory
    feature_file_path = Column(String)  # path to the file containing the feature
    tags = Column(String)  # metadata tags as JSON


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

    def exists(self, path, tags=None):
        """Check if the file has the representation.

        If tags are None, the method will ignore any metadata tags
        associated with the representation (if any).

        If tags are not None, they will be compared to the metadata
        tags associated with the representation. The method will
        return True only if provided tags are equal to the stored ones.

        Args:
            path (str): Original video file path relative to dataset root folder.
            tags (dict): Any metadata associated with the representation
                (e.g. file hash, pipeline config attributes, etc.).
        """
        with self.database.session_scope() as session:
            return self._exists(session, path, tags)

    def read(self, path, tags=None):
        """Read file's representation.

        If tags are None, the method will ignore any metadata tags
        associated with the representation (if any).

        If tags are not None, they will be checked against the metadata
        tags associated with the representation. The method will raise
        KeyError if provided tags are not equal to the stored ones.

        Args:
            path (str): Original video file path relative to dataset root folder.
            tags (dict): Any metadata associated with the representation
                (e.g. file hash, pipeline config attributes, etc.).
        """
        with self.database.session_scope() as session:
            record = self._record(session, path, tags).one_or_none()
            if record is None:
                raise KeyError(f"{path} with tags={tags}")
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            return self._load(feature_file_path)

    def tags(self, path):
        """Read file's representation metadata tags.

        Args:
            path (str): Original video file path relative to dataset root folder.
        """
        with self.database.session_scope() as session:
            record = self._record(session, path, tags=None).one_or_none()
            if record is None:
                raise KeyError(path)
            return self._deserialize_tags(record.tags)

    def write(self, path, value, tags=None):
        """Write the representation for the given file.

        Args:
            path (str): Original video file path relative to dataset root folder.
            value: Intermediate representation value to be stored.
            tags (dict): Any metadata associated with the representation
                (e.g. file hash, pipeline config attributes, etc.).
        """
        with self.database.session_scope() as session:
            record = self._get_or_create(session, path)
            record.tags = self._serialize_tags(tags)
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            self._save(feature_file_path, value)

    def delete(self, path):
        """Delete representation for the file."""
        with self.database.session_scope() as session:
            record = self._record(session, path, tags=None).one()
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            os.remove(feature_file_path)
            session.delete(record)

    def list(self):
        """Iterate over all (path,tags) pairs that already have this representation."""
        with self.database.session_scope() as session:
            for record in session.query(FeatureFile):
                yield record.source_path, self._deserialize_tags(record.tags)

    # Private methods

    @staticmethod
    def _record(session, path, tags):
        """Shortcut for querying record for the given feature-file."""
        if tags is None:
            return session.query(FeatureFile).filter(
                FeatureFile.source_path == path,
            )

        serialized_tags = SQLiteReprStorage._serialize_tags(tags)
        return session.query(FeatureFile).filter(
            FeatureFile.source_path == path,
            FeatureFile.tags == serialized_tags,
        )

    @staticmethod
    def _exists(session, path, tags):
        """Shortcut for checking record presence."""
        if tags is None:
            return session.query(FeatureFile.id).filter(
                FeatureFile.source_path == path,
            ).scalar() is not None

        serialized_tags = SQLiteReprStorage._serialize_tags(tags)
        return session.query(FeatureFile.id).filter(
            FeatureFile.source_path == path,
            FeatureFile.tags == serialized_tags
        ).scalar() is not None

    def _get_or_create(self, session, path):
        """Get feature-file record, create one with unique name if not exist."""
        feature_file = SQLiteReprStorage._record(session, path, tags=None).first()
        if feature_file is not None:
            return feature_file
        # Create a missing feature-file with unique path.
        feature_file = FeatureFile(
            source_path=path,
            feature_file_path=f"{uuid()}{self._suffix}")
        session.add(feature_file)
        return feature_file

    @staticmethod
    def _serialize_tags(tags):
        """Serialize tags to string."""
        return json.dumps(tags, sort_keys=True)

    @staticmethod
    def _deserialize_tags(tags):
        """Deserialize tags from string."""
        return json.loads(tags)
