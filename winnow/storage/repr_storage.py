import logging
import os
from glob import glob
from os.path import join, relpath, abspath, exists, dirname

import numpy as np

# Logger used in representation-storage module
logger = logging.getLogger("ReprStorage")


class _PathMapper:
    """Mapping from (path,hash) pair to corresponding file in some root folder.

    For each (path,hash) there is no more than one file presumably
    in the root directory (presumably with some content related to
    the original (path,hash) pair). The mapper is metadata-free:
    original path and hash are encoded in the mapped file path.
    """

    def __init__(self, directory, suffix="_vgg_features.npy"):
        """Parent directory in which mapped files are stored."""
        self.directory = abspath(directory)
        self.suffix = suffix

    def map(self, path, sha256):
        """Get corresponding file."""
        return join(self.directory, f"{path}_{sha256}{self.suffix}")

    def reverse(self, mapped_path):
        """Restore original (path, sha256) from mapped file path."""
        relative_path = relpath(abspath(mapped_path), self.directory)
        if not relative_path.endswith(self.suffix):
            raise ValueError(f"Not a reversible path: {mapped_path}")
        path_hash = relative_path[:-len("_vgg_features.npy")]
        split_index = path_hash.rfind("_")
        if split_index < 0:
            raise ValueError(f"Not a reversible path: {mapped_path}")
        path = path_hash[:split_index]
        sha256 = path_hash[split_index + 1:]
        return path, sha256


class ReprStorage:
    """Persistent storage of intermediate representations."""

    def __init__(self, root_directory):
        """Create a new ReprStorage instance.

        Args:
            root_directory (String): A root directory in which representations will be stored.
        """
        self.root_directory = abspath(root_directory)
        self.frame_level = _PathMapper(directory=join(self.root_directory, "frame_level"))
        self.video_level = _PathMapper(directory=join(self.root_directory, "video_level"))
        self.signature_directory = join(self.root_directory, "video_signatures")
        self.create_directories()

    def create_directories(self):
        """Ensure required directory structure."""
        if not exists(self.frame_level.directory):
            logger.info("Creating frame-level directory: %s", self.frame_level.directory)
            os.makedirs(self.frame_level.directory)

        if not os.path.exists(self.video_level.directory):
            logger.info("Creating video-level directory: %s", self.video_level.directory)
            os.makedirs(self.video_level.directory)

        if not os.path.exists(self.signature_directory):
            logger.info("Creating signatures directory: %s", self.signature_directory)
            os.makedirs(self.signature_directory)

    # Frame-level features

    def has_frame_features(self, path, sha256):
        """Check if the video file has frame-level features."""
        return exists(self.frame_level.map(path, sha256))

    def read_frame_features(self, path, sha256):
        """Read frame-level features of the video file."""
        return np.load(self.frame_level.map(path, sha256))

    def write_frame_features(self, path, sha256, value):
        """Write frame-level features of the video file."""
        feature_file_path = self.frame_level.map(path, sha256)
        if not exists(dirname(feature_file_path)):
            os.makedirs(dirname(feature_file_path))
        np.save(feature_file_path, value)

    def delete_frame_features(self, path, sha256):
        """Delete frame-level features of the video file."""
        os.remove(self.frame_level.map(path, sha256))

    def list_frame_features(self):
        """List all the video files that have frame-level features."""
        path_pattern = join(self.frame_level.directory, '**/*_vgg_features.npy')
        for repr_file_path in glob(path_pattern, recursive=True):
            yield self.frame_level.reverse(repr_file_path)

    # Video-level features

    def has_video_features(self, path, sha256):
        """Check if the video file has video-level features."""
        return exists(self.video_level.map(path, sha256))

    def read_video_features(self, path, sha256):
        """Read video-level features of the video file."""
        return np.load(self.video_level.map(path, sha256))

    def write_video_features(self, path, sha256, value):
        """Write video-level features of the video file."""
        feature_file_path = self.video_level.map(path, sha256)
        if not exists(dirname(feature_file_path)):
            os.makedirs(dirname(feature_file_path))
        np.save(feature_file_path, value)

    def delete_video_features(self, path, sha256):
        """Delete video-level features of the video file."""
        os.remove(self.video_level.map(path, sha256))

    def list_video_features(self):
        """List all the video files that have video-level features."""
        path_pattern = join(self.video_level.directory, '**/*_vgg_features.npy')
        for repr_file_path in glob(path_pattern, recursive=True):
            yield self.video_level.reverse(repr_file_path)

    # Video signatures

    def has_signature(self, path, sha256):
        """Check if the video file has a signature."""
        raise NotImplementedError()

    def read_signature(self, path, sha256):
        """Read signature of the video file."""
        raise NotImplementedError()

    def write_signature(self, path, sha256, value):
        """Write signature of the video file."""
        raise NotImplementedError()

    def delete_signature(self, path, sha256):
        """Delete signature of the video file."""
        raise NotImplementedError()

    def list_signatures(self):
        """List all the video files that have signature."""
        raise NotImplementedError()
