"""The repr module offers high-level utility functions to work with intermediate representations."""
import hashlib
import json
import logging

from winnow.config import Config
from winnow.config.config import StorageType
from winnow.storage.lmdb_repr_storage import LMDBReprStorage
from winnow.storage.repr_key import ReprKey
from winnow.storage.repr_utils import path_resolver
from winnow.storage.simple_repr_storage import SimpleReprStorage
from winnow.storage.sqlite_repr_storage import SQLiteReprStorage
from winnow.utils.files import get_hash

# Default logger module
logger = logging.getLogger(__name__)


def reprkey_resolver(config):
    """Create a function to get intermediate storage key and tags by the file path.

    Args:
        config (winnow.config.Config): Pipeline configuration.
    """

    storepath = path_resolver(config.sources.root)
    config_tag = get_config_tag(config)

    def reprkey(path):
        """Get intermediate representation storage key."""
        return ReprKey(path=storepath(path), hash=get_hash(path), tag=config_tag)

    return reprkey


def get_config_tag(config):
    """Get configuration tag.

    Whenever configuration changes making the intermediate representation
    incompatible the tag value will change as well.
    """

    # Configuration attributes that affect representation value
    config_attributes = dict(frame_sampling=config.proc.frame_sampling)

    sha256 = hashlib.sha256()
    sha256.update(json.dumps(config_attributes).encode("utf-8"))
    return sha256.hexdigest()[:40]


def repr_storage_factory(config: Config, default_factory=LMDBReprStorage):
    """Get storage factory depending on the storage type from the config."""

    def detect_storage(directory):
        """Detect existing storage."""
        if LMDBReprStorage.is_storage(directory):
            logger.info("Detected LMDB repr-storage in %s", directory)
            return LMDBReprStorage(directory)
        elif SQLiteReprStorage.is_storage(directory):
            logger.info("Detected SQLite repr-storage in %s", directory)
            return SQLiteReprStorage(directory)
        elif SimpleReprStorage.is_storage(directory):
            logger.info("Detected simple path-based repr-storage in %s", directory)
            return SimpleReprStorage(directory, config_tag=get_config_tag(config))
        else:
            logger.info("Cannot detect storage type in %s. Using default factory instead.", directory)
            return default_factory(directory)

    storage_type = config.repr.storage_type

    if storage_type is None:
        return default_factory
    elif storage_type is StorageType.LMDB:
        return LMDBReprStorage
    elif storage_type is StorageType.SIMPLE:
        return lambda directory: SimpleReprStorage(directory=directory, config_tag=get_config_tag(config))
    elif storage_type is StorageType.SQLITE:
        return SQLiteReprStorage
    elif storage_type is StorageType.DETECT:
        return detect_storage
    else:
        raise ValueError(f"Unsupported repr-storage type: {storage_type}")
