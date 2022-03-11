from typing import Collection

import luigi
from cached_property import cached_property

from winnow.collection.file_collection import FileCollection
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey


class PrefixFeatureTarget(luigi.Target):
    """Features of file with the given prefix."""

    def __init__(self, prefix: str, coll: FileCollection, reprs: BaseReprStorage):
        self.prefix: str = prefix
        self.coll: FileCollection = coll
        self.reprs: BaseReprStorage = reprs

    def exists(self):
        return not self.remaining_keys

    @cached_property
    def remaining_keys(self) -> Collection[FileKey]:
        """File keys with missing features."""
        result = []
        for file_key in self.coll.iter_keys(prefix=self.prefix):
            if not self.reprs.exists(file_key):
                result.append(file_key)
        return tuple(result)


class PathListFileFeatureTarget(luigi.Target):
    """Features of all files which collection-paths are listed in the text file."""

    def __init__(self, path_list_file: str, coll: FileCollection, reprs: BaseReprStorage):
        self.path_list_file: str = path_list_file
        self.coll: FileCollection = coll
        self.reprs: BaseReprStorage = reprs

    def exists(self):
        return not self.remaining_keys

    @cached_property
    def remaining_keys(self) -> Collection[FileKey]:
        """File keys with missing feature."""
        result = []
        with open(self.path_list_file, "r") as path_list:
            for collection_path in path_list.readlines():
                file_key = self.coll.file_key(collection_path.strip(), raise_exception=False)
                if file_key is not None:
                    result.append(file_key)
        return tuple(result)


class PathListFeatureTarget(luigi.Target):
    """Features of all files which collection-paths are listed."""

    def __init__(self, coll_path_list: Collection[str], coll: FileCollection, reprs: BaseReprStorage):
        self.coll_path_list: Collection[str] = coll_path_list
        self.coll: FileCollection = coll
        self.reprs: BaseReprStorage = reprs

    def exists(self):
        return not self.remaining_keys

    @cached_property
    def remaining_keys(self) -> Collection[FileKey]:
        """File keys with missing feature."""
        result = []
        for collection_path in self.coll_path_list:
            file_key = self.coll.file_key(collection_path.strip(), raise_exception=False)
            if file_key is not None:
                result.append(file_key)
        return tuple(result)
