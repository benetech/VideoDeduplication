import os
import tempfile
from pathlib import Path

import pytest

from winnow.storage.atomic_file import atomic_file_path, atomic_file_open


@pytest.fixture
def tempdir():
    """Create temporary directory."""
    with tempfile.TemporaryDirectory(prefix="atomic-file-tests-") as directory:
        yield directory


def file_contents(path):
    """Read entire file contents."""
    with open(path) as file:
        return file.read()


def write_file(path, content):
    with open(path, "w+") as file:
        file.write(content)


def root_directory(path):
    parents = [os.fspath(parent) for parent in Path(path).parents]
    if parents[-1] != ".":
        return parents[-1]
    return parents[-2]


class ExpectedException(Exception):
    """
    Exception raised by the test code to verify system-under-test error handling.
    A separate exception class is needed to distinguish client-code exception from
    the SUT exceptions.
    """


def test_atomic_path_success(tempdir):
    destination = os.path.join(tempdir, "destination-file")

    with atomic_file_path(destination, tmp_dir=tempdir) as temp_file:
        expected_content = "some-data"
        write_file(temp_file, expected_content)

    assert os.path.isfile(destination)
    assert file_contents(destination) == expected_content
    assert os.listdir(tempdir) == [os.path.basename(destination)]


def test_atomic_path_failure(tempdir):
    destination = os.path.join(tempdir, "destination-file")

    with pytest.raises(ExpectedException):
        with atomic_file_path(destination, tmp_dir=tempdir) as temp_file:
            expected_content = "some-data"
            write_file(temp_file, expected_content)
            raise ExpectedException()

    assert not os.path.exists(destination)
    assert os.listdir(tempdir) == []


def test_atomic_path_success_nested(tempdir):
    relative_path = "foo/bar/destination-file"
    destination = os.path.join(tempdir, relative_path)

    with atomic_file_path(destination, tmp_dir=tempdir) as temp_file:
        expected_content = "some-data"
        write_file(temp_file, expected_content)

    assert os.path.isfile(destination)
    assert file_contents(destination) == expected_content
    assert os.listdir(tempdir) == [root_directory(relative_path)]


def test_atomic_open_success(tempdir):
    destination = os.path.join(tempdir, "destination-file")

    with atomic_file_open(destination, mode="w+", tmp_dir=tempdir) as file:
        expected_content = "some-data"
        file.write(expected_content)

    assert os.path.isfile(destination)
    assert file_contents(destination) == expected_content
    assert os.listdir(tempdir) == [os.path.basename(destination)]


def test_atomic_open_failure(tempdir):
    destination = os.path.join(tempdir, "destination-file")

    with pytest.raises(ExpectedException):
        with atomic_file_open(destination, mode="w+", tmp_dir=tempdir) as file:
            expected_content = "some-data"
            file.write(expected_content)
            raise ExpectedException()

    assert not os.path.exists(destination)
    assert os.listdir(tempdir) == []


def test_atomic_open_success_nested(tempdir):
    relative_path = "foo/bar/destination-file"
    destination = os.path.join(tempdir, relative_path)

    with atomic_file_open(destination, mode="w+", tmp_dir=tempdir) as file:
        expected_content = "some-data"
        file.write(expected_content)

    assert os.path.isfile(destination)
    assert file_contents(destination) == expected_content
    assert os.listdir(tempdir) == [root_directory(relative_path)]
