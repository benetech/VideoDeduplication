from typing import List, Collection, Callable

import luigi
from cached_property import cached_property

from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.utils.repr import FileKeyResolver


class FileListFeaturesTarget(luigi.Target):
    def __init__(self, file_paths: List[str], reprs: BaseReprStorage, resolve_key: FileKeyResolver):
        self.file_paths: List[str] = file_paths
        self.reprs: BaseReprStorage = reprs
        self.resolve_key: FileKeyResolver = resolve_key
        self._remaining_paths = None
        self._remaining_keys = None

    def exists(self) -> bool:
        return len(self.remaining_paths) == 0

    def _calculate_remaining(self):
        """Calculate remaining paths and keys."""
        if self._remaining_keys is not None and self._remaining_paths is not None:
            return
        remaining_paths = []
        remaining_keys = []
        for path in self.file_paths:
            file_key = self.resolve_key(path)
            if not self.reprs.exists(file_key):
                remaining_paths.append(path)
                remaining_keys.append(file_key)
        self._remaining_keys = tuple(remaining_keys)
        self._remaining_paths = tuple(remaining_paths)

    @cached_property
    def remaining_paths(self) -> Collection[str]:
        """File paths missing in repr storage."""
        self._calculate_remaining()
        return self._remaining_paths

    @cached_property
    def remaining_keys(self) -> Collection[FileKey]:
        """File keys missing in repr storage."""
        self._calculate_remaining()
        return self._remaining_keys


class FilePatternFeaturesTarget(luigi.Target):
    def __init__(
        self,
        path_pattern: str,
        reprs: BaseReprStorage,
        resolve_key: FileKeyResolver,
        query_paths: Callable[[str], Collection[str]],
    ):
        self.path_pattern: str = path_pattern
        self.reprs: BaseReprStorage = reprs
        self.resolve_key: FileKeyResolver = resolve_key
        self.query_paths: Callable[[str], Collection[str]] = query_paths
        self._remaining_paths = None
        self._remaining_keys = None

    def exists(self) -> bool:
        return len(self.remaining_paths) == 0

    def _calculate_remaining(self):
        """Calculate remaining paths and keys."""
        if self._remaining_keys is not None and self._remaining_paths is not None:
            return
        remaining_paths = []
        remaining_keys = []
        for path in self.query_paths(self.path_pattern):
            file_key = self.resolve_key(path)
            if not self.reprs.exists(file_key):
                remaining_paths.append(path)
                remaining_keys.append(file_key)
        self._remaining_keys = tuple(remaining_keys)
        self._remaining_paths = tuple(remaining_paths)

    @cached_property
    def remaining_paths(self) -> Collection[str]:
        """File paths missing in repr storage."""
        self._calculate_remaining()
        return self._remaining_paths

    @cached_property
    def remaining_keys(self) -> Collection[FileKey]:
        """File keys missing in repr storage."""
        self._calculate_remaining()
        return self._remaining_keys
