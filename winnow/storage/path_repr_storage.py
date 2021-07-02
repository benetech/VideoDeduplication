import logging
import os
from glob import glob
from os.path import join, relpath, abspath, exists, dirname

import numpy as np

from winnow.storage.manifest import StorageManifest, StorageManifestFile

# Logger used in representation-storage module
logger = logging.getLogger(__name__)


class PathReprStorage:
    """Metadata-less persistent storage of intermediate representations.

    For each source file (path,hash) there is no more than one
    intermediate representation file in the storage directory.
    Original path and hash are encoded in the representation file path.
    """

    MANIFEST = StorageManifest(type="simple", version=0)

    @staticmethod
    def is_storage_heuristic(directory):
        """Check if directory contains manifest-less path-based repr storage."""
        if not os.path.isdir(directory):
            return False
        storage = PathReprStorage(directory)
        return any(storage.list())

    @staticmethod
    def is_storage(directory):
        manifest_file = StorageManifestFile(directory)
        if manifest_file.exists():
            return manifest_file.read().type == PathReprStorage.MANIFEST.type
        return PathReprStorage.is_storage_heuristic(directory)

    def __init__(self, directory, save=np.save, load=np.load, suffix="_vgg_features.npy"):
        """Create a new ReprStorage instance.

        Args:
            directory (String): A root directory in which representations will be stored.
            save (Function): Function to write representation value to the file.
            load (Function): Function to load representation value from file.
            suffix (String): A common suffix of intermediate representation files.
        """
        self.directory = abspath(directory)
        self.suffix = suffix
        self._save = save
        self._load = load
        if not exists(self.directory):
            logger.info("Creating intermediate representations directory: %s", self.directory)
            os.makedirs(self.directory)

        # Ensure directory contains compatible storage
        manifest_file = StorageManifestFile(self.directory)
        manifest_file.ensure(self.MANIFEST)

    def exists(self, path, sha256):
        """Check if the file has the representation."""
        return exists(self._map(path, sha256))

    def read(self, path, sha256):
        """Read file's representation."""
        return self._load(self._map(path, sha256))

    def write(self, path, sha256, value):
        """Write the representation for the given file."""
        feature_file_path = self._map(path, sha256)
        if not exists(dirname(feature_file_path)):
            os.makedirs(dirname(feature_file_path))
        self._save(feature_file_path, value)

    def delete(self, path, sha256):
        """Delete representation for the file."""
        os.remove(self._map(path, sha256))

    def list(self):
        """Iterate over all (path,sha256) pairs that already have this representation."""
        path_pattern = join(self.directory, f"**/*{self.suffix}")
        for repr_file_path in glob(path_pattern, recursive=True):
            entry = self._reverse(repr_file_path)
            if entry is not None:
                yield entry

    # Private methods

    def _map(self, path, sha256):
        """Get corresponding file."""
        return join(self.directory, f"{path}_{sha256}{self.suffix}")

    def _reverse(self, mapped_path):
        """Restore original (path, sha256) from mapped file path."""
        relative_path = relpath(abspath(mapped_path), self.directory)
        if not relative_path.endswith(self.suffix):
            return None
        path_hash = relative_path[: -len(self.suffix)]
        split_index = path_hash.rfind("_")
        if split_index < 0:
            return None
        path = path_hash[:split_index]
        sha256 = path_hash[split_index + 1 :]
        return path, sha256
