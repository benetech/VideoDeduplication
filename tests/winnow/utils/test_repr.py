import os
import tempfile

import numpy as np
import pytest

from winnow.config import Config
from winnow.config.config import StorageType
from winnow.storage.lmdb_repr_storage import LMDBReprStorage
from winnow.storage.repr_key import ReprKey
from winnow.storage.simple_repr_storage import SimpleReprStorage
from winnow.storage.sqlite_repr_storage import SQLiteReprStorage
from winnow.utils.repr import repr_storage_factory


def config(storage: StorageType) -> Config:
    """Create config."""
    result = Config()
    result.repr.storage_type = storage
    return result


def something():
    """Create some data."""
    return ReprKey(path="some-path", hash="some-hash", tag="some-tag"), np.array([42])


@pytest.fixture
def directory():
    """Create empty temporary directory for representation storage."""
    with tempfile.TemporaryDirectory(prefix="repr-storage-") as directory:
        yield directory


def test_storage_factory_default(directory):
    default_type = SimpleReprStorage
    storage_factory = repr_storage_factory(config(storage=None), default_factory=default_type)

    storage = storage_factory(directory)

    assert isinstance(storage, default_type)


def test_storage_factory_lmdb(directory):
    storage_factory = repr_storage_factory(config(storage=StorageType.LMDB))
    storage = storage_factory(directory)

    assert isinstance(storage, LMDBReprStorage)


def test_storage_factory_simple(directory):
    storage_factory = repr_storage_factory(config(storage=StorageType.SIMPLE))
    storage = storage_factory(directory)

    assert isinstance(storage, SimpleReprStorage)


def test_storage_factory_sqlite(directory):
    storage_factory = repr_storage_factory(config(storage=StorageType.SQLITE))
    storage = storage_factory(directory)

    assert isinstance(storage, SQLiteReprStorage)


def test_storage_factory_detect_lmdb(directory):
    existing = LMDBReprStorage(directory)
    existing.write(*something())

    storage_factory = repr_storage_factory(config(storage=StorageType.DETECT))
    storage = storage_factory(directory)

    assert isinstance(storage, LMDBReprStorage)


def test_storage_factory_detect_simple(directory):
    existing = SimpleReprStorage(directory)
    existing.write(*something())

    storage_factory = repr_storage_factory(config(storage=StorageType.DETECT))
    storage = storage_factory(directory)

    assert isinstance(storage, SimpleReprStorage)


def test_storage_factory_detect_sqlite(directory):
    existing = SQLiteReprStorage(directory)
    existing.write(*something())

    storage_factory = repr_storage_factory(config(storage=StorageType.DETECT))
    storage = storage_factory(directory)

    assert isinstance(storage, SQLiteReprStorage)


def test_storage_factory_detect_missing(directory):
    default_type = SimpleReprStorage
    storage_factory = repr_storage_factory(config(storage=None), default_factory=default_type)

    missing_directory = os.path.join(directory, "missing")
    storage = storage_factory(missing_directory)

    assert isinstance(storage, default_type)


def test_storage_factory_detect_empty(directory):
    default_type = SimpleReprStorage
    storage_factory = repr_storage_factory(config(storage=None), default_factory=default_type)

    storage = storage_factory(directory)

    assert isinstance(storage, default_type)
