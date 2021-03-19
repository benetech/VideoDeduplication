import os
import tempfile
from urllib.request import urlopen
from uuid import uuid4 as uuid

import pytest

from template_support.file_storage import LocalFileStorage


@pytest.fixture
def local_storage():
    """
    Create a new empty LocalFileStorage in a temporary directory.
    """
    with tempfile.TemporaryDirectory(prefix="file-storage-") as directory:
        yield LocalFileStorage(directory=directory)


@pytest.fixture
def tempdir():
    """Create temporary directory."""
    with tempfile.TemporaryDirectory(prefix="file-storage-tests-") as directory:
        yield directory


def some_path(directory) -> str:
    """Generate unique path in the directory."""
    return os.path.join(directory, str(uuid()))


def make_file(directory, text=None) -> str:
    """Write text file."""
    if text is None:
        text = f"Some unique text {uuid()}"
    path = some_path(directory)
    with open(path, "w") as file:
        file.write(text)
    return path


def content(path) -> str:
    """Read text file contents."""
    with open(path) as file:
        return file.read()


def read(file):
    """Read text content from URL."""
    with file:
        return file.read()


def test_fresh_is_empty(local_storage: LocalFileStorage):
    assert len(list(local_storage.keys())) == 0


def test_exists(local_storage: LocalFileStorage, tempdir: str):
    unknown = "unknown-key"
    saved_1 = local_storage.save_file(make_file(tempdir))
    saved_2 = local_storage.save_file(make_file(tempdir))

    assert local_storage.exists(saved_1)
    assert local_storage.exists(saved_2)
    assert not local_storage.exists(unknown)
    assert set(local_storage.keys()) == {saved_1, saved_2}


def test_get_file(local_storage: LocalFileStorage, tempdir: str):
    saved = make_file(tempdir)
    key = local_storage.save_file(saved)

    loaded = some_path(tempdir)
    local_storage.get_file(key, loaded)

    assert content(saved) == content(loaded)


def test_get_file_uri(local_storage: LocalFileStorage, tempdir: str):
    saved = make_file(tempdir)
    key = local_storage.save_file(saved)

    uri = local_storage.get_file_uri(key)

    assert uri is not None
    assert read(urlopen(uri)).decode("utf-8") == content(saved)


def test_open_file(local_storage: LocalFileStorage, tempdir: str):
    saved = make_file(tempdir)
    key = local_storage.save_file(saved)

    text_io = local_storage.open_file(key, binary=False)

    assert read(text_io) == content(saved)


def test_delete(local_storage: LocalFileStorage, tempdir: str):
    unknown = "unknown-key"
    saved_1 = local_storage.save_file(make_file(tempdir))
    saved_2 = local_storage.save_file(make_file(tempdir))

    assert set(local_storage.keys()) == {saved_1, saved_2}

    assert local_storage.delete(saved_1)
    assert set(local_storage.keys()) == {saved_2}

    assert local_storage.delete(saved_2)
    assert set(local_storage.keys()) == set()

    assert not local_storage.delete(unknown)
