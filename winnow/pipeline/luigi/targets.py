import os
from datetime import datetime
from typing import Collection, Optional, Sequence, Tuple, Callable

import luigi
from cached_property import cached_property

from winnow.collection.file_collection import FileCollection
from winnow.pipeline.luigi.utils import KeyIter, PathTime
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


class PrefixTarget(luigi.Target):
    def __init__(
        self,
        target_folder,
        target_name: str,
        target_ext: str,
        prefix: str,
        need_updates: Callable[[datetime], bool],
    ):
        self.path_prefix = os.path.normpath(os.path.join(target_folder, prefix, target_name))
        self.target_ext = target_ext
        self.prefix = prefix
        self._need_updates: Callable[[datetime], bool] = need_updates

    def exists(self):
        return not self._need_updates(self.latest_result_time)

    @property
    def latest_result_time(self) -> Optional[datetime]:
        """Get the latest created target file."""
        _, latest_time = PathTime.latest(f"{self.path_prefix}*")
        return latest_time

    @property
    def latest_result_path(self) -> str:
        """Get path of the latest result."""
        latest_path, _ = PathTime.latest(f"{self.path_prefix}*{self.target_ext}")
        return latest_path

    def path(self, time: datetime = None) -> str:
        """Suggest a new target path given the timestamp.

        If no timestamp is provided the current time will be used.
        """
        time = time or datetime.now()
        return PathTime.stamp(f"{self.path_prefix}{self.target_ext}", time)


class FileGroupTarget(luigi.Target):
    """Target representing a timestamped group of files."""

    def __init__(self, common_prefix: str, suffixes: Sequence[str], need_updates: Callable[[datetime], bool]):
        self.common_prefix: str = common_prefix
        self.suffixes = tuple(suffixes)
        self._need_updates: Callable[[datetime], bool] = need_updates

    def exists(self):
        _, latest_time = self.latest_result
        return not self._need_updates(latest_time)

    @property
    def latest_result(self) -> Tuple[Optional[Sequence[str]], Optional[datetime]]:
        """Get the latest existing result."""
        return PathTime.latest_group(self.common_prefix, self.suffixes)

    def suggest_paths(self, time: datetime = None) -> Sequence[str]:
        """Suggest files paths."""
        time = time or datetime.now()
        result = []
        for suffix in self.suffixes:
            result.append(PathTime.stamp(f"{self.common_prefix}{suffix}", time, suffix))
        return result
