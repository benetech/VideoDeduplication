"""This module offers a simple path-based repr-storage that ignores configuration tags."""
from typing import Iterator, Any

import numpy as np

from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.path_repr_storage import PathReprStorage
from winnow.storage.repr_key import ReprKey


class SimpleReprStorage(BaseReprStorage):
    """A path-based representation storage that ignores configuration tags.

    This is simply an adapter of legacy path storage to current protocol.
    """

    @staticmethod
    def is_storage(directory):
        """Check if the directory may contain path-based repr storage."""
        return PathReprStorage.is_storage(directory)

    def __init__(self, directory, config_tag="", save=np.save, load=np.load, suffix="_vgg_features.npy"):
        self._path_storage = PathReprStorage(directory=directory, save=save, load=load, suffix=suffix)
        self._config_tag = config_tag

    def exists(self, key: ReprKey) -> bool:
        """Check if the representation exists."""
        return self._path_storage.exists(path=key.path, sha256=key.hash)

    def read(self, key: ReprKey) -> Any:
        """Read file's representation."""
        return self._path_storage.read(path=key.path, sha256=key.hash)

    def write(self, key: ReprKey, value: Any):
        """Write the representation for the given file."""
        self._path_storage.write(path=key.path, sha256=key.hash, value=value)

    def delete(self, path: str):
        """Delete representation for the file."""
        self._path_storage.delete(path=path, sha256=None)

    def list(self) -> Iterator[ReprKey]:
        """Iterate over all storage keys."""
        for path, sha256 in self._path_storage.list():
            yield ReprKey(path=path, hash=sha256, tag=self._config_tag)

    def close(self):
        """Dispose storage. Noop operation for simple storage."""
        pass

    def __len__(self) -> int:
        """Count of storage entries."""
        total_count = 0
        for _ in self._path_storage.list():
            total_count += 1
        return total_count
