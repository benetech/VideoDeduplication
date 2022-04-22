from datetime import datetime
from typing import Collection, Optional, Sequence, Tuple, Callable, Dict

import luigi
from cached_property import cached_property
from sqlalchemy import func

from db import Database
from db.schema import TaskLogRecord
from winnow.collection.file_collection import FileCollection
from winnow.pipeline.luigi.utils import KeyIter
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.utils.files import PathTime
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


class FileWithTimestampTarget(luigi.Target):
    """This target represents task results as a file with some timestamp.

    Timestamp typically represents a limit up until which all the user data is already
    processed. To check if additional work is required task will need to get a file
    with maximal timestamp (the latest result) and check if a new data became available
    since then.

    The timestamp is encoded in the path because the file-system support for lust-modified time
    is too volatile: if file is moved or copied, the last-modified time may change (and hence
    some work may be skipped as a result).
    """

    def __init__(
        self,
        path_prefix: str,
        name_suffix: str,
        need_updates: Callable[[datetime], bool],
    ):
        self.path_prefix: str = path_prefix
        self.name_suffix: str = name_suffix
        self._need_updates: Callable[[datetime], bool] = need_updates

    def exists(self):
        return not self._need_updates(self.latest_result_time)

    @property
    def latest_result_time(self) -> Optional[datetime]:
        """Get the latest created target file."""
        _, latest_time = PathTime.latest(f"{self.path_prefix}*")
        return latest_time

    @property
    def latest_result_path(self) -> Optional[str]:
        """Get path of the latest result."""
        latest_path, _ = PathTime.latest(f"{self.path_prefix}*{self.name_suffix}")
        return latest_path

    def suggest_path(self, time: datetime = None) -> str:
        """Suggest a new target path given the timestamp.

        If no timestamp is provided the current time will be used.
        """
        time = time or datetime.now()
        return PathTime.stamp(f"{self.path_prefix}{self.name_suffix}", time, suffix=self.name_suffix)


class FileGroupTarget(luigi.Target):
    """This target represents task results as a group of files with the same timestamp.

    This target is useful when task produces several files and needs to mark all of them
    with the same timestamp. Timestamp typically represents a limit up until which all the
    user data is already processed. To check if additional work is required task will need
    to get a group of files with maximal timestamp (the latest result) and check if a new
    data became available since then.

    The timestamp is encoded in the path because the file-system support for lust-modified time
    is too volatile: if file is moved or copied, the last-modified time may change (and some
    data processing may be skipped as a result).

    Each file in a group has the same path prefix (common_prefix), timestamp and one of the suffixes:
        path = {common_prefix}__{timestamp}{suffix}

    A number of files in a group equals to the number of provided suffixes.
    All files in the same group must have the same timestamp.
    """

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


class TaskLogRecordTarget(luigi.Target):
    """Target which checks for presence of a TaskLogRecord in the database."""

    def __init__(
        self,
        task_name: str,
        details: Dict[str, str],
        database: Database,
        need_updates: Callable[[datetime], bool],
    ):
        self._task_name: str = task_name
        self._details: Dict[str, str] = details
        self._database: Database = database
        self._need_updates = need_updates

    def exists(self):
        return not self._need_updates(self.last_time)

    @property
    def last_time(self) -> Optional[datetime]:
        """Get the last log record."""
        with self._database.session_scope() as session:
            task_filters = [TaskLogRecord.task_name == self._task_name]
            for attr_name, attr_value in self._details.items():
                attr_filter = TaskLogRecord.details[attr_name].as_string() == attr_value
                task_filters.append(attr_filter)
            last_time = session.query(func.max(TaskLogRecord.timestamp)).filter(*task_filters)
            latest = TaskLogRecord.timestamp == last_time
            record: TaskLogRecord = session.query(TaskLogRecord).filter(latest, *task_filters).one_or_none()
            if record is None:
                return None
            return record.timestamp

    def write_log(self, time: datetime):
        """Write a log record."""
        with self._database.session_scope() as session:
            record = TaskLogRecord(task_name=self._task_name, timestamp=time, details=self._details)
            session.add(record)
