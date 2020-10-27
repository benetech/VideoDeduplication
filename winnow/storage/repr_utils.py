import os
from pathlib import Path

from winnow.utils import get_hash


def _storepath(path, source_root):
    """Get path relative to content root.

    Args:
        path (str): Path of the video file.
        source_root (Path): Path of the folder containing all video files.
    """
    absolute_path = os.path.abspath(path)
    if source_root not in Path(absolute_path).parents:
        raise ValueError(f"Path '{path}' is outside of content root folder '{source_root}'")
    return os.path.relpath(absolute_path, source_root)


def path_resolver(source_root):
    """Construct a function to calculate paths inside source root folder.

    Args:
        source_root (String): Path to the root folder in which all source video files are located.

    Returns:
         Function converting file path to paths relative to the content root. If the argument is outside
            the content root folder, the returned function will raise ValueError.
    """

    # Get canonical path of the content root folder
    source_root = Path(os.path.abspath(source_root))

    return lambda path: _storepath(path, source_root)


def bulk_read(store, select=None):
    """Read representations for the given original files (path,hash) pairs.

    If orig_files is None, all the entries from the provided representation store are loaded.

    Args:
        store: Representation store for a single representation type (e.g. PathReprStorage)
        select: List of original file (path, hash) pairs.

    Returns:
        Dictionary mapping (path,hash) of the original file to the loaded representation value.
    """
    path_hash_pairs = select or store.list()
    return {(path, sha256): store.read(path, sha256) for path, sha256 in path_hash_pairs}


def bulk_write(store, entries):
    """Write multiple entries to the representation store.

    Args:
        store: Representation store for a single representation type (e.g. PathReprStorage managing frame features).
        entries: A dictionary mapping multiple files (path, hash) => value.
    """
    for (path, sha256), value in entries.items():
        store.write(path, sha256, value)


def store_key_resolver(config):
    """Create a function to get intermediate storage key and tags by the file path.

    Args:
        config (winnow.config.Config): Pipeline configuration.
    """

    # Get canonical path of the content root folder
    source_root = Path(os.path.abspath(config.sources.root))

    def storekey(path):
        """Get intermediate representation storage key and tags for the given video-file path.

        Args:
            path (str): Video-file path.
        """
        store_path = _storepath(path, source_root)
        return store_path, dict(
            sha256=get_hash(path),
            frame_sampling=config.proc.frame_sampling
        )

    return storekey
