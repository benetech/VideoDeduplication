import tempfile
from itertools import islice

import numpy as np
import pytest

from winnow.storage.path_repr_storage import PathReprStorage
from winnow.storage.repr_utils import bulk_read, bulk_write
from winnow.storage.sqlite_repr_storage import SQLiteReprStorage


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
use_store = pytest.mark.parametrize('store', [PathReprStorage, SQLiteReprStorage], indirect=True)


@use_store
def test_empty(store):
    assert len(list(store.list())) == 0


@use_store
def test_exists(store):
    path, sha256, value = "some/path", "some-hash", np.array(["some-value"])

    # Doesn't exist before write
    assert not store.exists(path, sha256)

    # Exists when written
    store.write(path, sha256, value)
    assert store.exists(path, sha256)

    # Doesn't exist after deletion
    store.delete(path, sha256)
    assert not store.exists(path, sha256)


@use_store
def test_read_write(store):
    path, sha256, value, another_value = "some/path", "some-hash", np.array(["some-value"]), np.array(["another-value"])

    store.write(path, sha256, value)
    assert store.read(path, sha256) == value

    store.write(path, sha256, another_value)
    assert store.read(path, sha256) == another_value

    # Repeat write
    store.write(path, sha256, another_value)
    assert store.read(path, sha256) == another_value

    # Repeat read
    assert store.read(path, sha256) == another_value


@use_store
def test_read_write_multiple(store):
    path_1, sha256_1, value_1 = "some/path", "some-hash", np.array(["some-value"])
    path_2, sha256_2, value_2 = "other/path", "other-hash", np.array(["other-value"])

    store.write(path_1, sha256_1, value_1)
    store.write(path_2, sha256_2, value_2)

    assert store.exists(path_1, sha256_1)
    assert store.exists(path_2, sha256_2)
    assert store.read(path_1, sha256_1) == value_1
    assert store.read(path_2, sha256_2) == value_2

    # Mix up path and hash
    assert not store.exists(path_1, sha256_2)
    assert not store.exists(path_2, sha256_1)


@use_store
def test_list(store):
    assert list(store.list()) == []

    path_1, sha256_1 = "some/path", "some-hash"
    path_2, sha256_2 = "other/path", "other-hash"

    store.write(path_1, sha256_1, np.array(["some-value"]))
    assert set(store.list()) == {(path_1, sha256_1)}

    store.write(path_2, sha256_2, np.array(["some-value"]))
    assert set(store.list()) == {(path_1, sha256_1), (path_2, sha256_2)}

    store.delete(path_1, sha256_1)
    assert set(store.list()) == {(path_2, sha256_2)}


@use_store
def test_bulk_read_write(store):
    data_as_dict = {(f"some/path{i}", f"some-hash{i}"): np.array([f"some-value{i}"]) for i in range(100)}

    bulk_write(store, data_as_dict)
    assert bulk_read(store) == data_as_dict
    assert set(store.list()) == set(data_as_dict.keys())

    # Get half of the data
    subset = dict(islice(data_as_dict.items(), 0, int(len(data_as_dict) / 2)))
    assert bulk_read(store, select=subset.keys()) == subset
