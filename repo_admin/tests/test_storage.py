import tempfile
from typing import Optional
from uuid import uuid4 as uuid

import pytest

from repo_admin.bare_database.model import Repository
from repo_admin.bare_database.storage import RepoStorage


def make_repo(name=None, password: Optional[str] = "some-password"):
    """Create random repository."""
    return Repository(
        name=name or str(uuid()),
        host=str(uuid()),
        port=5432,
        database=str(uuid()),
        username=str(uuid()),
        password=password,
    )


@pytest.fixture
def storage():
    """Create managed bare-database repository storage."""
    with tempfile.TemporaryDirectory(prefix="representations-") as temporary:
        yield RepoStorage(directory=temporary)


def test_fresh_storage_is_empty(storage: RepoStorage):
    assert set(storage.names()) == set()


def test_saves_valid(storage: RepoStorage):
    saved = storage.save(repo=make_repo())
    fetched = storage.read(saved.name)

    assert set(storage.names()) == {saved.name}
    assert fetched == saved


def test_exists(storage: RepoStorage):
    saved = storage.save(repo=make_repo())

    assert storage.exists(name=saved.name)
    assert not storage.exists(name="unknown")


def test_names(storage: RepoStorage):
    first = storage.save(repo=make_repo())
    second = storage.save(repo=make_repo())

    assert set(storage.names()) == {first.name, second.name}


def test_delete(storage: RepoStorage):
    preserved = storage.save(repo=make_repo())
    deleted = storage.save(repo=make_repo())

    storage.delete(repo=deleted)

    assert not storage.exists(deleted.name)
    assert storage.exists(preserved.name)
    assert set(storage.names()) == {preserved.name}

    with pytest.raises(KeyError):
        storage.read(deleted.name)

    with pytest.raises(KeyError):
        storage.delete(repo=deleted)


def test_save_no_password(storage: RepoStorage):
    incomplete = storage.save(repo=make_repo(password=None))

    assert storage.read(incomplete.name) == incomplete


def test_save_invalid(storage: RepoStorage):
    invalid = make_repo(name="invalid // name")

    with pytest.raises(ValueError):
        storage.save(repo=invalid)


def test_repository_model():
    repo = Repository(
        name="some-name",
        host="some-host",
        port=5432,
        database="some-database",
        username="admin",
        password="password",
    )

    assert repo.uri == "postgresql://admin:password@some-host:5432/some-database"
