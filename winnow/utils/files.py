"""The files module offers high-level operations with file-system."""
import hashlib
import os
from datetime import datetime
from functools import lru_cache
from glob import glob
from pathlib import Path
from typing import Collection, Callable

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
        with open(file_path, "rb") as file:
            return hash_object(read_chunks(file, buffer_size), True)
    elif mode == HashMode.PATH:
        return hash_object(file_path, False)
    else:
        print('Error: mode "%s" is invalid. mode must be one of ("file", "path").' % str(mode))


@lru_cache(maxsize=None)
def hash_object(hashable, iterable=True) -> str:
    """Get sha256 hash of the specified object."""
    sha256 = hashlib.sha256()
    if iterable:
        for data in hashable:
            sha256.update(data)
    else:
        sha256.update(hashable)
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


def mtime_filter(min_mtime: datetime = None, max_mtime: datetime = None) -> Callable[[str], bool]:
    """Filter paths by last modified time."""
    min_timestamp = None
    max_timestamp = None
    if min_mtime is not None:
        min_timestamp = min_mtime.timestamp()
    if max_mtime is not None:
        max_timestamp = max_mtime.timestamp()

    if min_timestamp is None and max_timestamp is None:

        def always_true(path: str) -> bool:
            """None of the filters is specified."""
            return True

        return always_true

    def predicate(path: str) -> bool:
        """Check last modified date of the path."""
        timestamp = os.path.getmtime(path)
        return (min_timestamp is None or min_timestamp <= timestamp) and (
            max_timestamp is None or timestamp <= max_timestamp
        )

    return predicate
