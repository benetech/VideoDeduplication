"""The files module offers high-level operations with file-system."""
import hashlib
import os
from datetime import datetime
from functools import lru_cache, wraps, reduce
from glob import glob
from math import floor
from os import PathLike, fspath
from pathlib import Path
from typing import Collection, Callable, Union, MutableMapping, Iterator, Tuple, Optional, Sequence, List, Dict

from winnow.config.config import HashMode


def read_chunks(file_object, buffer_size=64 * 1024):
    """Read chunks from file object."""
    chunk = file_object.read(buffer_size)
    while chunk:
        yield chunk
        chunk = file_object.read(buffer_size)


def get_hash(file_path: str, mode: HashMode = HashMode.FILE, buffer_size: int = 64 * 1024) -> str:
    """Get sha256 hash of the file."""
    if mode == HashMode.FILE:
        return hash_file(file_path, buffer_size=buffer_size)
    elif mode == HashMode.PATH:
        return hash_str(file_path)
    else:
        hash_modes = [e.value for e in HashMode]
        hash_modes_str = '", "'.join(hash_modes)
        print('Error: mode "%s" is invalid. mode must be one of ("%s").' % (str(mode), hash_modes_str))


# Function to transform fs paths
PathMapFunc = Callable[[Union[str, PathLike]], str]

# Function to calculate hash for the given file
FileHashFunc = Callable[[Union[str, PathLike]], str]


class HashCache(MutableMapping[str, str]):
    """Persistent hash cache."""

    @staticmethod
    def same_path(suffix: str) -> PathMapFunc:
        """Path mapping strategy: place hash near the original file + append suffix."""

        if len(Path(suffix).parts) > 1:
            raise ValueError("Hash file suffix cannot contain directory delimiters.")

        def get_hash_file(path: Union[str, PathLike]) -> str:
            """Place hash near the original file + append suffix."""
            return f"{fspath(path)}.{suffix}"

        return get_hash_file

    @staticmethod
    def rebase_path(
        files_root: Union[str, PathLike],
        cache_root: Union[str, PathLike],
        suffix: str,
    ) -> PathMapFunc:
        """Path mapping strategy: place hash in the same subdirectory but use different root folder."""

        if len(Path(suffix).parts) > 1:
            raise ValueError("Hash file suffix cannot contain directory delimiters.")

        def get_hash_file(path: Union[str, PathLike]) -> str:
            """Place hash in the same subdirectory but use different root folder."""
            path_tail = os.path.relpath(path, files_root)
            return f"{fspath(os.path.join(cache_root, path_tail))}.{suffix}"

        return get_hash_file

    def __init__(self, map_path: PathMapFunc):
        self._map_path: PathMapFunc = map_path

    def __setitem__(self, file_path: Union[str, PathLike], hash_sum: str) -> None:
        """Save hash value."""
        hash_file_path = self._map_path(file_path)
        os.makedirs(os.path.dirname(hash_file_path), exist_ok=True)
        with open(hash_file_path, "w") as file:
            file.write(hash_sum)

    def __delitem__(self, file_path: Union[str, PathLike]) -> None:
        """Remove cached hash value."""
        hash_file_path = self._map_path(file_path)
        if not os.path.isfile(hash_file_path):
            raise KeyError(fspath(file_path))
        os.remove(hash_file_path)

    def __getitem__(self, file_path: Union[str, PathLike]) -> str:
        """Get cached file hash."""
        hash_file_path = self._map_path(file_path)
        if not os.path.isfile(hash_file_path):
            raise KeyError(fspath(file_path))
        # Check if hash outdated
        if os.path.getmtime(hash_file_path) < os.path.getmtime(file_path):
            raise KeyError(fspath(file_path))
        with open(hash_file_path, "r") as file:
            return file.read().strip()

    def __contains__(self, file_path: Union[str, PathLike]) -> bool:
        """Check if the hash for the given file is cached."""
        hash_file_path = self._map_path(file_path)
        return os.path.isfile(hash_file_path) and os.path.getmtime(hash_file_path) >= os.path.getmtime(file_path)

    def __len__(self) -> int:
        """Getting length is not implemented."""
        raise NotImplementedError("Getting length of hash cache is not implemented.")

    def __iter__(self) -> Iterator[str]:
        """Iteration over keys is not implemented."""
        raise NotImplementedError("Iteration over hash cache is not implemented.")

    def wrap(self, hash_func: FileHashFunc) -> FileHashFunc:
        """Enable caching for the given hash function."""

        @wraps(hash_func)
        @lru_cache(maxsize=None)
        def calculate_hash(path: Union[str, PathLike]) -> str:
            """Calculate file hash."""
            if path in self:
                return self[path]
            hash_sum = hash_func(path)
            self[path] = hash_sum
            return hash_sum

        return calculate_hash


def hash_path(path: Union[str, PathLike], algorithm=hashlib.sha256, mtime: bool = False) -> str:
    """Calculate hash from path and last modified time."""
    hash_sum = algorithm()
    hash_sum.update(fspath(path).encode("utf-8"))
    if mtime:
        mtime = os.path.getmtime(path)
        hash_sum.update(str(int(mtime * 1000)).encode("utf-8"))
    return hash_sum.hexdigest()


def hash_file(path: Union[str, PathLike], algorithm=hashlib.sha256, buffer_size: int = 64 * 1024) -> str:
    """Geta hash of a single file."""
    hash_sum = algorithm()
    with open(path, "rb") as file:
        for data in read_chunks(file, buffer_size):
            hash_sum.update(data)
    return hash_sum.hexdigest()


def hash_str(data: str, encoding="utf-8") -> str:
    """Hash given string."""
    sha256 = hashlib.sha256()
    sha256.update(data.encode(encoding))
    return sha256.hexdigest()


def filter_extensions(files, extensions):
    """Filter files by extensions."""
    extensions = {f".{ext}".lower() for ext in extensions}
    return [x for x in files if Path(x).suffix.lower() in extensions]


def scan_videos(path, wildcard, extensions=()):
    """Scans a directory for a given wildcard

    Args:
        path (String): Root path of the directory to be scanned
        wildcard (String): Wild card related to the files being searched
        (eg. ** for video files or **_vgg_features.npy for extracted features
        files) extensions (list, optional): Filter files by giving a list of
        supported file extensions (eg a list of video extensions).
        Defaults to [].

    Returns:
        List[String]: A list of file paths
    """
    files = glob(os.path.join(path, wildcard), recursive=True)
    files = [x for x in files if os.path.isfile(x)]
    if len(extensions) > 0:
        files = filter_extensions(files, extensions)

    return files


def _read_lines(file_path):
    """Read line from text file."""
    with open(file_path, encoding="utf-8") as file:
        return file.read().splitlines()


def scan_videos_from_txt(file_list_path, extensions=()):
    """Get existing files from the file list .txt file."""
    files = _read_lines(file_list_path)
    files = [x for x in files if os.path.isfile(x)]
    if len(extensions) > 0:
        files = filter_extensions(files, extensions)
    return files


def create_video_list(videos_to_be_processed, file_path):
    """Dump videos to be processed to the text file."""
    with open(file_path, "w", encoding="utf-8") as f:
        for item in videos_to_be_processed:
            f.write("%s\n" % item)
    return os.path.abspath(file_path)


def iter_files(path: str):
    """Iterate files recursively."""
    if os.path.isfile(path):
        yield path
    elif os.path.isdir(path):
        for entry_name in os.listdir(path):
            entry_path = os.path.join(path, entry_name)
            yield from iter_files(entry_path)


def extension_filter(extensions: Collection[str] = ()) -> Callable[[str], bool]:
    """Create path extensions filter."""
    extensions = {f".{ext}".lower() for ext in extensions}

    def predicate(path: str) -> bool:
        """Check if the path has expected extension."""
        return Path(path).suffix.lower() in extensions

    return predicate


def mtime_filter(
    min_mtime: datetime = None,
    max_mtime: datetime = None,
    get_time: Callable[[str], float] = os.path.getmtime,
) -> Callable[[str], bool]:
    """Filter paths by last modified time."""
    min_timestamp = None
    max_timestamp = None
    if min_mtime is not None:
        min_timestamp = floor(min_mtime.timestamp() * 1000)
    if max_mtime is not None:
        max_timestamp = floor(max_mtime.timestamp() * 1000)

    if min_timestamp is None and max_timestamp is None:

        def always_true(path: str) -> bool:
            """None of the filters is specified."""
            return True

        return always_true

    def predicate(path: str) -> bool:
        """Check last modified date of the path."""
        timestamp = floor(get_time(path) * 1000)
        return (min_timestamp is None or min_timestamp < timestamp) and (
            max_timestamp is None or timestamp <= max_timestamp
        )

    return predicate


def is_parent(path: Union[str, PathLike], parent_path: Union[str, PathLike]) -> bool:
    """Check if ``path`` is located under the ``parent_path``."""
    return Path(parent_path) in Path(path).parents


def split_suffix(path: str, suffix: str = None) -> Tuple[str, str]:
    """Split path into a pair (base-name, suffix).

    If suffix is provided, it will try to chop the provided suffix.
    Otherwise, the file extension will be chopped.
    """
    if suffix is None:
        return os.path.splitext(path)
    if path.endswith(suffix):
        return path[: -len(suffix)], suffix
    return path, ""


class PathTime:
    FORMAT = "%Y_%m_%d_%H%M%S%f"
    DELIM = "__"

    @staticmethod
    def previous(
        path: str, suffix: str = None, format: str = FORMAT, delim: str = DELIM
    ) -> Tuple[Optional[str], Optional[datetime]]:
        """Get the equivalent existing path with the latest timestamp smaller than the given path timestamp."""
        this_time = PathTime.parse(path, suffix, format, delim)
        pattern = PathTime.pattern(path, suffix, delim)
        candidates = {}
        for path, time in PathTime.find(pattern, suffix, format, delim):
            if time < this_time:
                candidates[time] = path
        if not candidates:
            return None, None
        previous_time = max(candidates.keys())
        previous_path = candidates[previous_time]
        return previous_path, previous_time

    @staticmethod
    def pattern(path: str, suffix: str = None, delim: str = DELIM) -> str:
        """Get timestamped files pattern."""
        head, _, suffix = PathTime.split(path, suffix, delim)
        return f"{head}{delim}*{suffix}"

    @staticmethod
    def split(path: str, suffix: str = None, delim: str = DELIM) -> Tuple[str, str, str]:
        """Split timestamped path into a tuple (prefix, timestamp, suffix)."""
        prefix, suffix = split_suffix(path, suffix)
        prefix_parts = prefix.rsplit(delim, maxsplit=1)
        timestamp = ""
        if len(prefix_parts) == 2:
            prefix, timestamp = prefix_parts
        return prefix, timestamp, suffix

    @staticmethod
    def stamp(path: str, time: datetime, suffix: str = None, format: str = FORMAT, delim: str = DELIM) -> str:
        """Add timestamp to the file path."""
        directory = os.path.dirname(path)
        basename = os.path.basename(path)
        name, extension = split_suffix(basename, suffix)
        timestamp = time.strftime(format)
        return os.path.join(directory, f"{name}{delim}{timestamp}{extension}")

    @staticmethod
    def parse(path: str, suffix: str = None, format: str = FORMAT, delim: str = DELIM) -> Optional[datetime]:
        """Parse datetime from the file path."""
        head, _ = split_suffix(path, suffix)
        parts = head.rsplit(delim, maxsplit=1)
        if len(parts) != 2:
            return None
        timestamp = parts[-1]
        try:
            return datetime.strptime(timestamp, format)
        except ValueError:
            return None

    @staticmethod
    def latest(
        pattern: str, suffix: str = None, format: str = FORMAT, delim: str = DELIM
    ) -> Tuple[Optional[str], Optional[datetime]]:
        """Get path with the latest timestamp."""
        latest_time = None
        latest_path = None
        for path in glob(pattern, recursive=True):
            time = PathTime.parse(path, suffix=suffix, format=format, delim=delim)
            if time is not None and (latest_time is None or time > latest_time):
                latest_time = time
                latest_path = path
        return latest_path, latest_time

    @staticmethod
    def find(
        pattern: str, suffix: str = None, format: str = FORMAT, delim: str = DELIM
    ) -> Iterator[Tuple[str, datetime]]:
        """Find all timestamped paths."""
        for path in glob(pattern, recursive=True):
            time = PathTime.parse(path, suffix=suffix, format=format, delim=delim)
            if time is not None:
                yield path, time

    @staticmethod
    def find_groups(
        common_prefix: str, suffixes: Sequence[str], format: str = FORMAT, delim: str = DELIM
    ) -> Sequence[Tuple[Sequence[str], datetime]]:
        """List all groups of files with different timestamps."""
        # For each suffix collect all paths for this suffix as dict(time->path)
        timestamps_per_suffix: List[Dict[datetime, str]] = []
        for suffix in suffixes:
            path_pattern = f"{common_prefix}*{suffix}"
            found_paths = PathTime.find(path_pattern, suffix, format, delim)
            suffix_timestamps: Dict[datetime, str] = {}
            for path, time in found_paths:
                suffix_timestamps[time] = path
            timestamps_per_suffix.append(suffix_timestamps)

        # Calculate timestamps that exist for all suffixes
        timestamp_sets_per_suffix = [set(ts.keys()) for ts in timestamps_per_suffix]
        common_timestamps = sorted(reduce(lambda a, b: a & b, timestamp_sets_per_suffix))

        # Build results list
        results = []
        for time in common_timestamps:
            paths = []
            for time_path in timestamps_per_suffix:
                paths.append(time_path[time])
            results.append((paths, time))
        return results

    @staticmethod
    def latest_group(
        common_prefix: str, suffixes: Sequence[str], format: str = FORMAT, delim: str = DELIM
    ) -> Tuple[Optional[Sequence[str]], Optional[datetime]]:
        """Find the latest group of timestamped files with the same timestamp."""
        latest_paths: Optional[Sequence[str]] = None
        latest_time: Optional[datetime] = None
        for paths, time in PathTime.find_groups(common_prefix, suffixes, format, delim):
            if latest_time is None or latest_time < time:
                latest_paths = paths
                latest_time = time
        return latest_paths, latest_time

    @staticmethod
    def stamp_group(
        common_prefix: str, suffixes: Sequence[str], time: datetime, format: str = FORMAT, delim: str = DELIM
    ) -> Sequence[str]:
        """Timestamp file path group."""
        result = []
        for suffix in suffixes:
            path = f"{common_prefix}{suffix}"
            result.append(PathTime.stamp(path, time, suffix, format, delim))
        return result
