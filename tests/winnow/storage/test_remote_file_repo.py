import os
import tempfile

import pytest

from winnow.storage.remote_file_repo import RemoteFileRepo


class MockStorage:
    """Mock remote file storage."""

    def __init__(self, expected_files, expected_content):
        self.expected_files = set(expected_files)
        self.expected_content = expected_content

    def exists(self, relpath):
        return relpath in self.expected_files

    def download(self, relpath, local_path):
        if not self.exists(relpath):
            raise FileNotFoundError(relpath)
        with open(local_path, 'w+') as file:
            file.write(self.expected_content)


@pytest.fixture
def expected_files():
    """List of existing files."""
    return [f"some/file{i}" for i in range(10)]


@pytest.fixture
def expected_file(expected_files):
    """Get existing remote file name."""
    return expected_files[0]


@pytest.fixture
def expected_content():
    """Get expected remote file content."""
    return "Some content."


@pytest.fixture
def remote(expected_files, expected_content):
    """Create a mock remote storage."""
    return MockStorage(expected_files, expected_content)


@pytest.fixture
def repo(remote):
    """Create a new empty file repo in a temporary directory."""
    with tempfile.TemporaryDirectory(prefix="remote-repo-") as directory:
        yield RemoteFileRepo(directory=directory, remote=remote)


def test_empty(repo: RemoteFileRepo):
    assert repo.list_local() == []


def test_download(repo: RemoteFileRepo, expected_file):
    assert not repo.is_local(expected_file)

    model_file_path = repo.download(expected_file)
    assert repo.is_local(expected_file)
    assert os.path.isfile(model_file_path)
    assert repo.list_local() == [expected_file]
    assert repo.get(expected_file) == model_file_path


def test_autoload(repo: RemoteFileRepo, expected_file):
    assert not repo.is_local(expected_file)

    file_path = repo.get(expected_file)
    assert repo.is_local(expected_file)
    assert os.path.exists(file_path)


def test_delete(repo: RemoteFileRepo, expected_file):
    model_file_path = repo.get(expected_file)
    repo.delete(expected_file)

    assert not repo.is_local(expected_file)
    assert repo.list_local() == []
    assert not os.path.exists(model_file_path)


def test_clean(repo: RemoteFileRepo, expected_files):
    for file in expected_files:
        repo.get(file)

    assert set(repo.list_local()) == set(expected_files)

    local_paths = [repo.get(file) for file in expected_files]
    for path in local_paths:
        assert os.path.isfile(path)

    repo.clean()
    assert repo.list_local() == []
    for path in local_paths:
        assert not os.path.exists(path)


def test_exists(repo, expected_file):
    assert repo.exists(expected_file)

    repo.get(expected_file)
    assert repo.exists(expected_file)

    repo.delete(expected_file)
    assert repo.exists(expected_file)

    assert not repo.exists("unexpected")


def test_content(repo: RemoteFileRepo, expected_file, expected_content):
    file_path = repo.get(expected_file)
    with open(file_path, 'r') as file:
        assert file.read() == expected_content
