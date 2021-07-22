import logging
import os
import shutil
import tempfile
from contextlib import contextmanager
from os import PathLike


# Default logger of the module
_logger = logging.getLogger(__name__)


def _ensure_directory_exists(directory_path: PathLike):
    """
    Make sure directory with the given path exists. If directory doesn't exist, create one.
    Args:
        directory_path (PathLike): directory path to be checked.
    """
    if not os.path.isdir(directory_path):
        _logger.debug("Creating missing directory: %s", directory_path)
        os.makedirs(directory_path, exist_ok=True)


@contextmanager
def atomic_file_path(destination_path: PathLike, tmp_prefix: str = None, tmp_suffix: str = None, tmp_dir: str = None):
    """
    Context manager that creates a temporary file in the local filesystem
    before moving it to the destination path. The context manager yields
    a temporary file path which could be used by a client code to perform
    write operations. If the client code block finishes without errors the
    context manager will move the temporary file to the destination path.

    Args:
        destination_path (PathLike): destination path.
        tmp_prefix (str): optional temporary file prefix
        tmp_suffix (str): optional temporary file suffix
        tmp_dir (str): optional temporary file directory
    """
    fd, temporary_path = tempfile.mkstemp(prefix=tmp_prefix, suffix=tmp_suffix, dir=tmp_dir)
    os.close(fd)  # Client code is only interested in the temporary path
    try:
        yield temporary_path
        _ensure_directory_exists(os.path.dirname(destination_path))
        shutil.move(temporary_path, destination_path)
    finally:
        if os.path.exists(temporary_path):
            os.remove(temporary_path)


@contextmanager
def atomic_file_open(
    destination_path: PathLike, mode: str = "w+b", tmp_prefix: str = None, tmp_suffix: str = None, tmp_dir: str = None
):
    """
    Context manager that creates a temporary file in the local filesystem
    before moving it to the destination path. The context manager yields
    a File-Like ojbect which could be used by a client code to perform
    write operations. If the client code block finishes without errors the
    context manager will move the temporary file to the destination path.

    Args:
        destination_path (PathLike): destination path.
        mode (str): read/write mode, same as for builtin ``open`` function
        tmp_prefix (str): optional temporary file prefix
        tmp_suffix (str): optional temporary file suffix
        tmp_dir (str): optional temporary file directory
    """
    with atomic_file_path(destination_path, tmp_prefix=tmp_prefix, tmp_suffix=tmp_suffix, tmp_dir=tmp_dir) as tmp_path:
        with open(tmp_path, mode=mode) as file:
            yield file
