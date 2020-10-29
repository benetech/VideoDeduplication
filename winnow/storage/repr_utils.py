import os
from pathlib import Path


def path_resolver(source_root):
    """Construct a function to calculate paths inside source root folder.

    Args:
        source_root (String): Path to the root folder in which all source video files are located.

    Returns:
         function: Function to relativize paths to the dataset root folder. If the argument is outside
            the content root folder, the returned function will raise ValueError.
    """

    # Get canonical path of the content root folder
    source_root = Path(os.path.abspath(source_root))

    def storepath(path):
        """Get path relative to content root."""
        absolute_path = os.path.abspath(path)
        if source_root not in Path(absolute_path).parents:
            raise ValueError(f"Path '{path}' is outside of content root folder '{source_root}'")
        return os.path.relpath(absolute_path, source_root)

    return storepath


def bulk_read(store, select=None):
    """Read representations for the given storage keys.

    If select is None, all the entries from the provided representation store are loaded.

    Args:
        store: Representation store for a single representation type (e.g. LMBDBReprStorage)
        select: Iterable over storage keys.

    Returns:
        Dictionary mapping storage keys to the loaded representation value.
    """
    keys = select or store.list()
    return {key: store.read(key) for key in keys}


def bulk_write(store, entries):
    """Write multiple entries to the representation store.

    Args:
        store: Representation store for a single representation type (e.g. PathReprStorage managing frame features).
        entries: A dictionary mapping multiple ReprKey => value.
    """
    for key, value in entries.items():
        store.write(key, value)
