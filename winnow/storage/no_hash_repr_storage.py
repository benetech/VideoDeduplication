import logging
import os
from glob import glob
from typing import Iterator, Any

import numpy as np

from winnow.storage.atomic_file import atomic_file_open
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.storage.manifest import StorageManifest, StorageManifestFile

# Default logger for the current module
_logger = logging.getLogger(__name__)


def _legacy_load(loader):
    """Make adaptive loader."""

    def legacy_loader(*args, **kwargs):
        value = loader(*args, **kwargs)
        if len(value.shape) == 2:
            return value[0]
        return value

    return legacy_loader


class NoHashReprStorage(BaseReprStorage):
    """Simple path-based storage without hashes.

    For each source file path there is at most one
    intermediate representation file in the storage directory.
    NoHashReprStorage ignores FileKey.hash when storing values.
    """

    MANIFEST = StorageManifest(type="nohash", version=1)

    @staticmethod
    def is_storage_heuristic(directory):
        """Check if directory contains NoHashReprStorage without manifest."""
        if not os.path.isdir(directory):
            return False
        storage = NoHashReprStorage(directory)
        return any(storage.list())

    @staticmethod
    def is_storage(directory):
        """Simple storage is an extension of legacy path repr storage."""
        manifest_file = StorageManifestFile(directory)
        if manifest_file.exists():
            return manifest_file.read().type == NoHashReprStorage.MANIFEST.type
        return NoHashReprStorage.is_storage_heuristic(directory)

    def __init__(
        self,
        directory,
        save=np.save,
        load=_legacy_load(np.load),
        repr_suffix="_vgg_features.npy",
    ):
        """Create a new ReprStorage instance.

        Args:
            directory (str): A root directory in which representations will be stored.
            save (Function): Function to write representation value to the file.
            load (Function): Function to load representation value from file.
            repr_suffix (str): A common suffix of intermediate representation files.
        """
        self.directory = os.path.abspath(directory)
        self._repr_suffix = repr_suffix
        self._save = save
        self._load = load
        if not os.path.isdir(self.directory):
            _logger.info("Creating intermediate representations directory: %s", self.directory)
            os.makedirs(self.directory)

        # Ensure directory contains compatible storage
        manifest_file = StorageManifestFile(self.directory)
        manifest_file.ensure(self.MANIFEST)

    def exists(self, key: FileKey) -> bool:
        """Check if the file has the representation."""
        return os.path.isfile(self._map(key, self._repr_suffix))

    def read(self, key: FileKey) -> Any:
        """Read file's representation."""
        return self._load(self._map(key, self._repr_suffix))

    def write(self, key: FileKey, value, metadata: Any = None):
        """Write the representation for the given file.

        Args:
            key (FileKey): source video file path and hash (hash is ignored).
            value (Any): intermediate representation value.
            metadata (Any): ignored by NoHashReprStorage.
        """
        feature_file_path = self._map(key, self._repr_suffix)
        with atomic_file_open(feature_file_path) as file:
            self._save(file, value)

    def delete(self, key: FileKey):
        """Delete representation for the file."""
        if not self.exists(key):
            raise KeyError(key)
        os.remove(self._map(key, self._repr_suffix))

    def list(self) -> Iterator[FileKey]:
        """Iterate over all (path,sha256) pairs that already have this representation."""
        path_pattern = os.path.join(self.directory, f"**/*{self._repr_suffix}")
        for repr_file_path in glob(path_pattern, recursive=True):
            entry = self._reverse(repr_file_path, self._repr_suffix)
            if entry is not None:
                yield entry

    def read_metadata(self, key: FileKey):
        """NoHashReprStorage doesn't support metadata. Always returns None."""
        return None

    def has_metadata(self, key: FileKey) -> bool:
        """NoHashReprStorage doesn't support metadata. Always returns False."""
        return False

    def close(self):
        """Dispose repr storage."""
        pass  # Nothing to do ...

    # Private methods

    def _map(self, key: FileKey, suffix):
        """Get corresponding file."""
        return os.path.join(self.directory, f"{key.path}{suffix}")

    def _reverse(self, mapped_path: str, suffix: str) -> FileKey:
        """Restore original FileKey from mapped file path."""
        relative_path = os.path.relpath(os.path.abspath(mapped_path), self.directory)
        if not relative_path.endswith(suffix):
            return None
        path = relative_path[: -len(suffix)]
        return FileKey(path, "")

    def __len__(self) -> int:
        """Get storage entries count."""
        result = 0
        for _ in self.list():
            result += 1
        return result
