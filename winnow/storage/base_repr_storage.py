"""This module offers the abstract-base class describing repr-storage protocol."""

import abc
from typing import Any, Iterator, Callable

from winnow.storage.file_key import FileKey


class BaseReprStorage(abc.ABC):
    """Abstract base class for persistent representation storage.

    For each dataset file path there is a single entry in the storage.
    Each entry is associated with the file hash and configuration tag.

    The purpose of the file hash is to guarantee that whenever original
    file content changes the client must be able to detect that to update
    the stored representation value.

    Each storage entry may have optional metadata associated with it.
    This is useful if we want to check algorithm options that were used
    to calculate the intermediate representation.
    """

    @abc.abstractmethod
    def exists(self, key: FileKey) -> bool:
        """Check if the representation exists."""

    @abc.abstractmethod
    def read(self, key: FileKey) -> Any:
        """Read file's representation."""

    @abc.abstractmethod
    def write(self, key: FileKey, value: Any, metadata: Any = None):
        """Write the representation for the given file.

        Args:
            key (FileKey): source video file path and hash.
            value (Any): intermediate representation value.
            metadata (Any): optional metadata.
        """

    @abc.abstractmethod
    def read_metadata(self, key: FileKey):
        """Get feature metadata (like frame sampling, etc.)."""

    @abc.abstractmethod
    def has_metadata(self, key: FileKey) -> bool:
        """Check if the representation has metadata."""

    @abc.abstractmethod
    def delete(self, path: str):
        """Delete representation for the file."""

    @abc.abstractmethod
    def list(self) -> Iterator[FileKey]:
        """Iterate over all storage keys."""

    @abc.abstractmethod
    def close(self):
        """Dispose any storage-related resources: close database connections, etc."""

    @abc.abstractmethod
    def __len__(self) -> int:
        """Get storage entries count."""


# Type hint for representation storage factory
ReprStorageFactory = Callable[[str], BaseReprStorage]
