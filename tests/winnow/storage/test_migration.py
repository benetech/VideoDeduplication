import random
import tempfile
from uuid import uuid4 as uuid

import numpy as np
import pytest

from winnow.config import Config
from winnow.storage.legacy.lmdb_repr_storage import LMDBReprStorage
from winnow.storage.legacy.path_repr_storage import PathReprStorage
from winnow.storage.repr_migrate import PathToLMDBMigration
from winnow.storage.repr_storage import ReprStorage


@pytest.fixture
def source():
    """Create an empty temporary source directory."""
    with tempfile.TemporaryDirectory(prefix="source-storage-") as directory:
        yield directory


def make_repr():
    """Create random file representation."""
    return f"some/path/{uuid()}", f"some-hash-{uuid()}", tuple(random.randint(0, 100) for _ in range(10))


def make_reprs(count=10):
    """Create multiple random representations."""
    return [make_repr() for _ in range(count)]


def write_all_path(path_storage, reprs):
    """Write all representations to the path storage."""
    for path, sha256, value in reprs:
        path_storage.write(path, sha256, np.array(value))


def read_all_path(path_storage):
    """Read all representations from the path storage as a set."""
    return set((path, sha256, tuple(path_storage.read(path, sha256))) for path, sha256 in path_storage.list())


def read_all_lmdb(lmdb_storage):
    """Read all representations from the lmdb storage as a set."""
    return set((key.path, key.hash, tuple(lmdb_storage.read(key))) for key in lmdb_storage.list())


def make_config(repr_root):
    """Create a default config with the given representations folder."""
    config = Config()
    config.repr.directory = repr_root
    return config


def write_every(storage: ReprStorage, reprs, write=write_all_path):
    """Write values to every representation type."""
    write(storage.frames, reprs)
    write(storage.frame_level, reprs)
    write(storage.video_level, reprs)
    write(storage.signature, reprs)


def check_every(storage: ReprStorage, read, expected):
    """Check every representation type contains expected values."""
    assert read(storage.frames) == expected
    assert read(storage.frame_level) == expected
    assert read(storage.video_level) == expected
    assert read(storage.signature) == expected


def close_all(storage: ReprStorage):
    """Close all lmdb storages."""
    storage.frames.close()
    storage.frame_level.close()
    storage.video_level.close()
    storage.signature.close()


def test_migrate_all_inplace(source):
    reprs = set(make_reprs(count=10))
    path_storage = ReprStorage(directory=source, storage_factory=PathReprStorage)
    lmdb_storage = ReprStorage(directory=source, storage_factory=LMDBReprStorage)
    write_every(path_storage, reprs)

    # Check initial state
    check_every(path_storage, read_all_path, reprs)
    check_every(lmdb_storage, read_all_lmdb, set())

    close_all(lmdb_storage)
    path_to_lmdb = PathToLMDBMigration(make_config(repr_root=source))
    path_to_lmdb.migrate_all_inplace()

    # Check post migration state
    lmdb_storage = ReprStorage(directory=source, storage_factory=LMDBReprStorage)
    check_every(path_storage, read_all_path, reprs)
    check_every(lmdb_storage, read_all_lmdb, reprs)


def test_migrate_all_inplace_clean_source(source):
    reprs = set(make_reprs(count=10))
    path_storage = ReprStorage(directory=source, storage_factory=PathReprStorage)
    lmdb_storage = ReprStorage(directory=source, storage_factory=LMDBReprStorage)
    write_every(path_storage, reprs)

    # # Check initial state
    check_every(path_storage, read_all_path, reprs)
    check_every(lmdb_storage, read_all_lmdb, set())

    close_all(lmdb_storage)
    path_to_lmdb = PathToLMDBMigration(make_config(repr_root=source))
    path_to_lmdb.migrate_all_inplace(clean_source=True)

    # Check post migration state
    lmdb_storage = ReprStorage(directory=source, storage_factory=LMDBReprStorage)
    check_every(path_storage, read_all_path, set())
    check_every(lmdb_storage, read_all_lmdb, reprs)
