import logging
import os
from uuid import uuid4 as uuid

import numpy as np
from sqlalchemy import Column, String, Integer, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base

from db import Database

# Logger used in representation-storage module
logger = logging.getLogger("ReprStorage")


class Feature:
    """Enum for feature types."""
    frame_level = "frame-level"
    video_level = "video-level"
    signature = "signature"


# Base-class for database entities
Base = declarative_base()


class FeatureFile(Base):
    """A file containing some representation of source video file."""

    __tablename__ = 'frame_features'
    __table_args__ = (UniqueConstraint('source_path', 'source_sha256', 'feature', name='_feature_uc'),)

    id = Column(Integer, primary_key=True)
    source_path = Column(String)  # source video-file path
    source_sha256 = Column(String)  # source video-file hash
    feature = Column(String)  # feature stored in the file (e.g. frame-level, video-level, etc.)
    feature_file_path = Column(String)  # path to the file containing the feature


class SQLiteReprStorage:
    """SQLite-based persistent storage of intermediate representations."""

    # The storage is implemented as follows:
    #   * All information is stored in some user-specified directory.
    #   * SQLite database file is created at the root of the storage directory.
    #   * For each saved representation there is a file containing the representation value in the storage directory.
    #   * For each saved representation there is database record matching source file's (path,sha256), feature-type and
    #     the name of the file containing the corresponding representation value.

    def __init__(self, directory):
        """Create new storage instance."""
        self.directory = os.path.abspath(directory)

        if not os.path.exists(directory):
            logger.info("Creating intermediate representation directory: %s", self.directory)
            os.makedirs(self.directory)

        self.db_file = os.path.join(self.directory, "repr.sqlite")
        self.database = Database(f"sqlite:///{self.db_file}", base=Base)
        self.database.create_tables()

    # Frame-level features

    def has_frame_features(self, path, sha256):
        """Check if the video file has frame-level features."""
        return self._has_features(path, sha256, Feature.frame_level)

    def read_frame_features(self, path, sha256):
        """Read frame-level features of the video file."""
        return self._read_features(path, sha256, Feature.frame_level)

    def write_frame_features(self, path, sha256, value):
        """Write frame-level features of the video file."""
        self._write_features(path, sha256, Feature.frame_level, value)

    def delete_frame_features(self, path, sha256):
        """Delete frame-level features of the video file."""
        self._delete_features(path, sha256, Feature.frame_level)

    def list_frame_features(self):
        """List all the video files that have frame-level features."""
        return self._list_features(Feature.frame_level)

    # Video-level features

    def has_video_features(self, path, sha256):
        """Check if the video file has video-level features."""
        return self._has_features(path, sha256, Feature.video_level)

    def read_video_features(self, path, sha256):
        """Read video-level features of the video file."""
        return self._read_features(path, sha256, Feature.video_level)

    def write_video_features(self, path, sha256, value):
        """Write video-level features of the video file."""
        self._write_features(path, sha256, Feature.video_level, value)

    def delete_video_features(self, path, sha256):
        """Delete video-level features of the video file."""
        self._delete_features(path, sha256, Feature.video_level)

    def list_video_features(self):
        """List all the video files that have video-level features."""
        return self._list_features(Feature.video_level)

    # Video signatures

    def has_signature(self, path, sha256):
        """Check if the video file has a signature."""
        return self._has_features(path, sha256, Feature.video_level)

    def read_signature(self, path, sha256):
        """Read signature of the video file."""
        return self._read_features(path, sha256, Feature.video_level)

    def write_signature(self, path, sha256, value):
        """Write signature of the video file."""
        self._write_features(path, sha256, Feature.video_level, value)

    def delete_signature(self, path, sha256):
        """Delete signature of the video file."""
        self._delete_features(path, sha256, Feature.video_level)

    def list_signatures(self):
        """List all the video files that have signature."""
        return self._list_features(Feature.video_level)

    # ----------------------------------
    #  Below are the private methods
    # ----------------------------------

    def _has_features(self, path, sha256, feature_type):
        """Check if the file has these features."""
        with self.database.session_scope() as session:
            return self._exists(session, path, sha256, feature_type)

    def _read_features(self, path, sha256, feature_type, load=np.load):
        """Read file's frame-level features."""
        with self.database.session_scope() as session:
            record = self._record(session, path, sha256, feature_type).one()
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            return load(feature_file_path)

    def _write_features(self, path, sha256, feature_type, features_value, save=np.save):
        """Write this features for the given file."""
        with self.database.session_scope() as session:
            record = self._get_or_create(session, path, sha256, feature_type)
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            save(feature_file_path, features_value)

    def _delete_features(self, path, sha256, feature_type):
        """Delete these features for the file."""
        with self.database.session_scope() as session:
            record = self._record(session, path, sha256, feature_type).one()
            feature_file_path = os.path.join(self.directory, record.feature_file_path)
            os.remove(feature_file_path)
            session.delete(record)

    def _list_features(self, feature_type):
        """Iterate over all (path,sha256) pairs that already have these features."""
        with self.database.session_scope() as session:
            for record in session.query(FeatureFile).filter(FeatureFile.feature == feature_type):
                yield record.source_path, record.source_sha256

    @staticmethod
    def _record(session, path, sha256, feature):
        """Shortcut for querying record for the given feature-file."""
        return session.query(FeatureFile).filter(
            FeatureFile.source_path == path,
            FeatureFile.source_sha256 == sha256,
            FeatureFile.feature == feature
        )

    @staticmethod
    def _exists(session, path, sha256, feature):
        """Shortcut for checking record presence."""
        return session.query(FeatureFile.id).filter(
            FeatureFile.source_path == path,
            FeatureFile.source_sha256 == sha256,
            FeatureFile.feature == feature
        ).scalar() is not None

    @staticmethod
    def _get_or_create(session, path, sha256, feature, suffix="_vgg_features.npy"):
        """Get feature-file record, create one with unique name if not exist."""
        feature_file = SQLiteReprStorage._record(session, path, sha256, feature).first()
        if feature_file is not None:
            return feature_file
        # Create a missing feature-file with unique path.
        feature_file = FeatureFile(
            source_path=path, source_sha256=sha256, feature=feature,
            feature_file_path=f"{uuid()}{suffix}")
        session.add(feature_file)
        return feature_file
