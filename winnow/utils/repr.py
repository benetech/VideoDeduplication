"""The repr module offers high-level utility functions to work with intermediate representations."""
import logging
from os import PathLike
from typing import Callable

from winnow.config import Config
from winnow.config.config import StorageType
from winnow.storage.base_repr_storage import ReprStorageFactory
from winnow.storage.file_key import FileKey
from winnow.storage.legacy import LMDBReprStorage, SQLiteReprStorage
from winnow.storage.legacy.wrapper import LegacyStorageWrapper
from winnow.storage.repr_utils import path_resolver
from winnow.storage.simple_repr_storage import SimpleReprStorage
from winnow.utils.files import get_hash

# Default logger module
logger = logging.getLogger(__name__)


def filekey_resolver(config: Config) -> Callable[[str], FileKey]:
    """Create a function to generate video FileKey(storage-path, hash) from the path.

    Args:
        config (Config): Pipeline configuration.
    """
    storepath = path_resolver(config.sources.root)

    def filekey(path: PathLike, hash: str = None) -> FileKey:
        """Convert path and optional hash to the FileKey. Caclulate missing hashes."""
        if hash is None:
            hash = get_hash(path, config.repr.hash_mode)
        return FileKey(path=storepath(path), hash=hash)

    return filekey


def repr_storage_factory(
    storage_type: StorageType,
    default_factory: ReprStorageFactory = SimpleReprStorage,
) -> ReprStorageFactory:
    """Get storage factory depending on the storage type from the config."""

    def detect_storage(directory):
        """Detect existing storage."""
        if LMDBReprStorage.is_storage(directory):
            logger.info("Detected LMDB repr-storage in %s", directory)
            return LegacyStorageWrapper(LMDBReprStorage(directory))
        elif SQLiteReprStorage.is_storage(directory):
            logger.info("Detected SQLite repr-storage in %s", directory)
            return LegacyStorageWrapper(SQLiteReprStorage(directory))
        elif SimpleReprStorage.is_storage(directory):
            logger.info("Detected simple path-based repr-storage in %s", directory)
            return SimpleReprStorage(directory)
        else:
            logger.info("Cannot detect storage type in %s. Using default factory instead.", directory)
            return default_factory(directory)

    if storage_type is StorageType.SIMPLE:
        return SimpleReprStorage
    elif storage_type is StorageType.LMDB:
        return LegacyStorageWrapper.factory(LMDBReprStorage)
    elif storage_type is StorageType.SQLITE:
        return LegacyStorageWrapper.factory(SQLiteReprStorage)
    elif storage_type is StorageType.DETECT or storage_type is None:
        return detect_storage
    else:
        raise ValueError(f"Unrecognized repr-storage type: {storage_type}")
