from typing import Collection

import luigi
from cached_property import cached_property

from winnow.collection.file_collection import FileCollection
from winnow.pipeline.luigi.utils import KeyIter
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.utils.iterators import skip


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
        keys_iter = skip(self.reprs.exists, self.coll.iter_keys(prefix=self.prefix))
        return tuple(keys_iter)


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
        keys_iter = skip(self.reprs.exists, KeyIter.from_file(self.coll, self.path_list_file))
        return tuple(keys_iter)


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
        keys_iter = skip(self.reprs.exists, KeyIter.from_paths(self.coll, self.coll_path_list))
        return tuple(keys_iter)
