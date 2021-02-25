"""This module offers the abstract-base class describing repr-storage protocol."""

import abc
from typing import Any, Iterator

from winnow.storage.repr_key import ReprKey


class BaseReprStorage(abc.ABC):
    """Abstract base class for persistent representation storage.

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

    @abc.abstractmethod
    def exists(self, key: ReprKey) -> bool:
        """Check if the representation exists."""

    @abc.abstractmethod
    def read(self, key: ReprKey) -> Any:
        """Read file's representation."""

    @abc.abstractmethod
    def write(self, key: ReprKey, value: Any):
        """Write the representation for the given file."""

    @abc.abstractmethod
    def delete(self, path: str):
        """Delete representation for the file."""

    @abc.abstractmethod
    def list(self) -> Iterator[ReprKey]:
        """Iterate over all storage keys."""

    @abc.abstractmethod
    def close(self):
        """Dispose any storage-related resources: close database connections, etc."""

    @abc.abstractmethod
    def __len__(self) -> int:
        """Count of storage entries."""
