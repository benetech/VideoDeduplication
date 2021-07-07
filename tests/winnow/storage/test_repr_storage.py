import tempfile
from itertools import islice
from uuid import uuid4 as uuid

import numpy as np
import pytest
from dataclasses import asdict

from winnow.storage.legacy.lmdb_repr_storage import LMDBReprStorage
from winnow.storage.legacy.repr_key import ReprKey
from winnow.storage.repr_utils import bulk_read, bulk_write
from winnow.storage.legacy.sqlite_repr_storage import SQLiteReprStorage


# NOTE: exactly the same tests are executed for each basic repr-storage type.


# This is an indirect fixture that receives storage type as an argument.
# Please see # https://docs.pytest.org/en/stable/example/parametrize.html#indirect-parametrization
@pytest.fixture
def store(request):
    """
    Create a new empty repr storage of the
    requested type in a temporary directory.
    """
    store_type = request.param
    with tempfile.TemporaryDirectory(prefix="repr-store-") as directory:
        yield store_type(directory=directory)


# Shortcut for pytest parametrize decorator.
# Decorated test will be executed for all existing representation store types.
use_store = pytest.mark.parametrize("store", [LMDBReprStorage, SQLiteReprStorage], indirect=True)


def make_key():
    """Make some repr storage key."""
    unique = uuid()
    return ReprKey(path=f"some/path-{unique}", hash=f"some-hash-{unique}", tag=f"some-tag-{unique}")


def make_entry():
    """Make some repr storage entry."""
    return make_key(), np.array([str(uuid())])


def copy(key, **kwargs):
    args = asdict(key)
    args.update(kwargs)
    return ReprKey(**args)


@use_store
def test_empty(store):
    assert len(list(store.list())) == 0


@use_store
def test_exists(store):
    key, value = make_entry()

    # Doesn't exist before write
    assert not store.exists(key)

    # Exists when written
    store.write(key, value)
    assert store.exists(key)

    # Doesn't exist after deletion
    store.delete(key.path)
    assert not store.exists(key)


@use_store
def test_read_write(store):
    key, value, another_value = make_key(), np.array(["some-value"]), np.array(["another-value"])

    store.write(key, value)
    assert store.read(key) == value

    store.write(key, another_value)
    assert store.read(key) == another_value

    # Repeat write
    store.write(key, another_value)
    assert store.read(key) == another_value

    # Repeat read
    assert store.read(key) == another_value


@use_store
def test_read_write_multiple(store):
    key_1, value_1 = make_entry()
    key_2, value_2 = make_entry()

    store.write(key_1, value_1)
    store.write(key_2, value_2)

    assert store.exists(key_1)
    assert store.exists(key_2)
    assert store.read(key_1) == value_1
    assert store.read(key_2) == value_2

    # Mix up path and hash
    unknown = make_key()
    assert not store.exists(unknown)
    assert not store.exists(copy(key_1, hash=key_2.hash))
    assert not store.exists(copy(key_1, tag=key_2.tag))
    assert not store.exists(copy(key_2, hash=key_1.hash))
    assert not store.exists(copy(key_2, tag=key_1.tag))


@use_store
def test_list(store):
    assert list(store.list()) == []

    key_1, key_2 = make_key(), make_key()

    store.write(key_1, np.array(["some-value"]))
    assert set(store.list()) == {key_1}

    store.write(key_2, np.array(["some-value"]))
    assert set(store.list()) == {key_1, key_2}

    store.delete(key_1.path)
    assert set(store.list()) == {key_2}


@use_store
def test_bulk_read_write(store):
    data_as_dict = dict(make_entry() for _ in range(100))

    bulk_write(store, data_as_dict)
    assert bulk_read(store) == data_as_dict
    assert set(store.list()) == set(data_as_dict.keys())

    # Get half of the data
    subset = dict(islice(data_as_dict.items(), 0, int(len(data_as_dict) / 2)))
    assert bulk_read(store, select=subset.keys()) == subset
