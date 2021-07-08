import logging
import os
from glob import glob
from typing import Any

import numpy as np

import winnow.storage.legacy as legacy
from winnow.storage.atomic_file import atomic_file_open
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.storage.manifest import StorageManifest, StorageManifestFile
from winnow.storage.metadata import DataLoader, FeaturesMetadata

# Logger used in representation-storage module
logger = logging.getLogger(__name__)


class SimpleReprStorage(BaseReprStorage):
    """Simple path-based storage of intermediate representations.

    For each source file (path,hash) there is at most one
    intermediate representation file in the storage directory.
    Original path and hash are encoded in the representation file path.
    """

    MANIFEST = StorageManifest(type="simple", version=1)

    @staticmethod
    def is_storage(directory):
        """Simple storage is an extension of legacy path repr storage."""
        return legacy.PathReprStorage.is_storage(directory)

    def __init__(
        self,
        directory,
        save=np.save,
        load=np.load,
        repr_suffix="_vgg_features.npy",
        metadata_suffix="_metadata.json",
        metadata_loader=DataLoader(FeaturesMetadata),
    ):
        """Create a new ReprStorage instance.

        Args:
            directory (str): A root directory in which representations will be stored.
            save (Function): Function to write representation value to the file.
            load (Function): Function to load representation value from file.
            repr_suffix (str): A common suffix of intermediate representation files.
            metadata_suffix (str): A common suffix of metadata files.
            metadata_loader (DataLoader): A class used to dump & load metadata.
        """
        self.directory = os.path.abspath(directory)
        self._repr_suffix = repr_suffix
        self._save = save
        self._load = load
        self._metadata_suffix = metadata_suffix
        self._metadata_loader = metadata_loader
        if not os.path.isdir(self.directory):
            logger.info("Creating intermediate representations directory: %s", self.directory)
            os.makedirs(self.directory)

        # Ensure directory contains compatible storage
        manifest_file = StorageManifestFile(self.directory)
        manifest_file.ensure(self.MANIFEST)

    def exists(self, key: FileKey) -> bool:
        """Check if the file has the representation."""
        return os.path.isfile(self._map(key, self._repr_suffix))

    def read(self, key: FileKey):
        """Read file's representation."""
        return self._load(self._map(key, self._repr_suffix))

    def write(self, key: FileKey, value, metadata: Any = None):
        """Write the representation for the given file.

        Args:
            key (FileKey): source video file path and hash.
            value (Any): intermediate representation value.
            metadata (Any): optional metadata.
        """
        feature_file_path = self._map(key, self._repr_suffix)
        with atomic_file_open(feature_file_path) as file:
            self._save(file, value)
            if metadata is None:
                return
            # Write metadata if not None
            metadata_file_path = self._map(key, self._metadata_suffix)
            with atomic_file_open(metadata_file_path, mode="w+") as metadata_file:
                self._metadata_loader.dump(metadata, metadata_file)

    def delete(self, key: FileKey):
        """Delete representation for the file."""
        if not self.exists(key):
            raise KeyError(key)
        if self.has_metadata(key):
            os.remove(self._map(key, self._metadata_suffix))
        os.remove(self._map(key, self._repr_suffix))

    def list(self):
        """Iterate over all (path,sha256) pairs that already have this representation."""
        path_pattern = os.path.join(self.directory, f"**/*{self._repr_suffix}")
        for repr_file_path in glob(path_pattern, recursive=True):
            entry = self._reverse(repr_file_path, self._repr_suffix)
            if entry is not None:
                yield entry

    def read_metadata(self, key: FileKey):
        """Get feature metadata (like frame sampling, etc.)."""
        if not self.exists(key):
            raise KeyError(key)
        if not self.has_metadata(key):
            return None
        metadata_file_path = self._map(key, self._metadata_suffix)
        with open(metadata_file_path, "r") as metadata_file:
            return self._metadata_loader.load(metadata_file)

    def has_metadata(self, key: FileKey) -> bool:
        """Check if the representation has metadata."""
        if not self.exists(key):
            raise KeyError(key)
        metadata_file_path = self._map(key, self._metadata_suffix)
        return os.path.isfile(metadata_file_path)

    def close(self):
        """Dispose simple repr storage."""
        pass  # Nothing to do ...

    # Private methods

    def _map(self, key: FileKey, suffix):
        """Get corresponding file."""
        return os.path.join(self.directory, f"{key.path}_{key.hash}{suffix}")

    def _reverse(self, mapped_path: str, suffix: str) -> FileKey:
        """Restore original FileKey from mapped file path."""
        relative_path = os.path.relpath(os.path.abspath(mapped_path), self.directory)
        if not relative_path.endswith(suffix):
            return None
        path_hash = relative_path[: -len(suffix)]
        split_index = path_hash.rfind("_")
        if split_index < 0:
            return None
        path = path_hash[:split_index]
        sha256 = path_hash[split_index + 1 :]
        return path, sha256
