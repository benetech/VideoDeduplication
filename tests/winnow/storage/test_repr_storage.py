import tempfile
from itertools import islice
from uuid import uuid4 as uuid

import numpy as np
import pytest
from dataclasses import asdict

from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey
from winnow.storage.metadata import FeaturesMetadata
from winnow.storage.repr_utils import bulk_read, bulk_write
from winnow.storage.simple_repr_storage import SimpleReprStorage


@pytest.fixture
def storage():
    """Create a new empty repr storage."""
    with tempfile.TemporaryDirectory(prefix="repr-store-") as directory:
        yield SimpleReprStorage(directory=directory)


def make_key() -> FileKey:
    """Make unique file key."""
    unique = uuid()
    return FileKey(path=f"some/path-{unique}", hash=f"some-hash-{unique}")


def make_entry():
    """Make some repr storage entry."""
    return make_key(), np.array([str(uuid())])


def copy(key: FileKey, **kwargs) -> FileKey:
    """Copy file key and optionally update some of the attributes."""
    args = asdict(key)
    args.update(kwargs)
    return FileKey(**args)


def test_empty(storage: BaseReprStorage):
    assert len(list(storage.list())) == 0


def test_exists(storage: BaseReprStorage):
    key, value = make_entry()

    # Doesn't exist before write
    assert not storage.exists(key)

    # Exists when written
    storage.write(key, value)
    assert storage.exists(key)

    # Doesn't exist after deletion
    storage.delete(key)
    assert not storage.exists(key)


def test_read_write(storage: BaseReprStorage):
    key, value, another_value = make_key(), np.array(["some-value"]), np.array(["another-value"])

    storage.write(key, value)
    assert storage.read(key) == value

    storage.write(key, another_value)
    assert storage.read(key) == another_value

    # Repeat write
    storage.write(key, another_value)
    assert storage.read(key) == another_value

    # Repeat read
    assert storage.read(key) == another_value


def test_read_write_multiple(storage: BaseReprStorage):
    key_1, value_1 = make_entry()
    key_2, value_2 = make_entry()

    storage.write(key_1, value_1)
    storage.write(key_2, value_2)

    assert storage.exists(key_1)
    assert storage.exists(key_2)
    assert storage.read(key_1) == value_1
    assert storage.read(key_2) == value_2

    # Mix up path and hash
    unknown = make_key()
    assert not storage.exists(unknown)
    assert not storage.exists(copy(key_1, hash=key_2.hash))
    assert not storage.exists(copy(key_2, hash=key_1.hash))


def test_list(storage: BaseReprStorage):
    assert list(storage.list()) == []

    key_1, key_2 = make_key(), make_key()

    storage.write(key_1, np.array(["some-value"]))
    assert set(storage.list()) == {key_1}

    storage.write(key_2, np.array(["some-value"]))
    assert set(storage.list()) == {key_1, key_2}

    storage.delete(key_1)
    assert set(storage.list()) == {key_2}


def test_bulk_read_write(storage: BaseReprStorage):
    data_as_dict = dict(make_entry() for _ in range(100))

    bulk_write(storage, data_as_dict)
    assert bulk_read(storage) == data_as_dict
    assert set(storage.list()) == set(data_as_dict.keys())

    # Get half of the data
    subset = dict(islice(data_as_dict.items(), 0, int(len(data_as_dict) / 2)))
    assert bulk_read(storage, select=subset.keys()) == subset


def test_write_metadata(storage: BaseReprStorage):
    key, value = make_entry()
    expected_metadata = FeaturesMetadata(frame_sampling=42)

    storage.write(key, value, metadata=expected_metadata)

    assert storage.has_metadata(key)
    assert storage.read_metadata(key) == expected_metadata


def test_no_metadata(storage: BaseReprStorage):
    key, value = make_entry()

    storage.write(key, value)

    assert not storage.has_metadata(key)
    assert storage.read_metadata(key) is None


def test_missing_key_metadata(storage: BaseReprStorage):
    key, value = make_entry()

    with pytest.raises(KeyError):
        storage.read_metadata(key)

    storage.write(key, value, metadata=FeaturesMetadata(frame_sampling=42))
    storage.delete(key)

    with pytest.raises(KeyError):
        storage.read_metadata(key)
