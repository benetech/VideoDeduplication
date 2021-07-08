from typing import Iterator, Any

from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.storage.legacy import ReprKey
from winnow.storage.legacy.legacy_repr_storage import LegacyReprStorage


def _repr_key(file_key: FileKey) -> ReprKey:
    """Convert file key to repr key."""
    return ReprKey(path=file_key.path, hash=file_key.hash, tag=None)


def _file_key(repr_key: ReprKey) -> FileKey:
    """Convert legacy repr key to file key."""
    return FileKey(path=repr_key.path, hash=repr_key.hash)


class LegacyStorageWrapper(BaseReprStorage):
    """Adapter of the legacy storage to the new API."""

    @staticmethod
    def factory(legacy_factory):
        """Create a wrapped storage factory."""

        def make_storage(*args, **kwargs):
            """Do create a wrapped storage."""
            legacy_storage = legacy_factory(*args, **kwargs)
            return LegacyStorageWrapper(legacy_storage)

        return make_storage

    def __init__(self, storage: LegacyReprStorage):
        self._storage = storage

    @property
    def wrapped(self):
        """Get wrapped storage."""
        return self._storage

    def exists(self, key: FileKey) -> bool:
        """Check if the representation exists."""
        return self._storage.exists(_repr_key(key), check_tag=False)

    def read(self, key: FileKey) -> Any:
        """Read file's representation."""
        return self._storage.read(_repr_key(key), check_tag=False)

    def write(self, key: FileKey, value: Any, metadata: Any = None):
        """Write the representation for the given file.

        Args:
            key (FileKey): source video file path and hash.
            value (Any): intermediate representation value.
            metadata (Any): optional metadata.
        """
        return self._storage.write(_repr_key(key), value)

    def read_metadata(self, key: FileKey):
        """Get feature metadata (like frame sampling, etc.)."""
        return None

    def has_metadata(self, key: FileKey) -> bool:
        """Check if the representation has metadata."""
        return False

    def delete(self, path: str):
        """Delete representation for the file."""
        pass

    def list(self) -> Iterator[FileKey]:
        """Iterate over all storage keys."""
        for repr_key in self._storage.list():
            yield _file_key(repr_key)

    def close(self):
        """Dispose any storage-related resources: close database connections, etc."""
        self._storage.close()
