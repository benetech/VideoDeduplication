import os
import tempfile

import numpy as np
import pytest

import winnow.storage.legacy as legacy
from winnow.config.config import StorageType
from winnow.storage.file_key import FileKey
from winnow.storage.legacy.wrapper import LegacyStorageWrapper
from winnow.storage.simple_repr_storage import SimpleReprStorage
from winnow.utils.repr import repr_storage_factory


def something():
    """Create some data."""
    return FileKey(path="some-path", hash="some-hash"), np.array([42])


@pytest.fixture
def directory():
    """Create empty temporary directory for representation storage."""
    with tempfile.TemporaryDirectory(prefix="repr-storage-") as directory:
        yield directory


def test_storage_factory_default(directory):
    default_type = SimpleReprStorage
    storage_factory = repr_storage_factory(storage_type=None, default_factory=default_type)

    storage = storage_factory(directory)

    assert isinstance(storage, default_type)


def test_storage_factory_lmdb(directory):
    storage_factory = repr_storage_factory(StorageType.LMDB)
    storage = storage_factory(directory)

    assert isinstance(storage, LegacyStorageWrapper)
    assert isinstance(storage.wrapped, legacy.LMDBReprStorage)


def test_storage_factory_simple(directory):
    storage_factory = repr_storage_factory(StorageType.SIMPLE)
    storage = storage_factory(directory)

    assert isinstance(storage, SimpleReprStorage)


def test_storage_factory_sqlite(directory):
    storage_factory = repr_storage_factory(StorageType.SQLITE)
    storage = storage_factory(directory)

    assert isinstance(storage, LegacyStorageWrapper)
    assert isinstance(storage.wrapped, legacy.SQLiteReprStorage)


def test_storage_factory_detect_lmdb(directory):
    existing = LegacyStorageWrapper(legacy.LMDBReprStorage(directory))
    existing.write(*something())

    storage_factory = repr_storage_factory(StorageType.DETECT)
    storage = storage_factory(directory)

    assert isinstance(storage, LegacyStorageWrapper)
    assert isinstance(storage.wrapped, legacy.LMDBReprStorage)


def test_storage_factory_detect_simple(directory):
    existing = SimpleReprStorage(directory)
    existing.write(*something())

    storage_factory = repr_storage_factory(StorageType.DETECT)
    storage = storage_factory(directory)

    assert isinstance(storage, SimpleReprStorage)


def test_storage_factory_detect_sqlite(directory):
    existing = LegacyStorageWrapper(legacy.SQLiteReprStorage(directory))
    existing.write(*something())

    storage_factory = repr_storage_factory(StorageType.DETECT)
    storage = storage_factory(directory)

    assert isinstance(storage, LegacyStorageWrapper)
    assert isinstance(storage.wrapped, legacy.SQLiteReprStorage)


def test_storage_factory_detect_missing(directory):
    default_type = SimpleReprStorage
    storage_factory = repr_storage_factory(storage_type=None, default_factory=default_type)

    missing_directory = os.path.join(directory, "missing")
    storage = storage_factory(missing_directory)

    assert isinstance(storage, default_type)


def test_storage_factory_detect_empty(directory):
    default_type = SimpleReprStorage
    storage_factory = repr_storage_factory(storage_type=None, default_factory=default_type)

    storage = storage_factory(directory)

    assert isinstance(storage, default_type)
