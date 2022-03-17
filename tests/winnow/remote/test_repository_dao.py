import os
import tempfile
from typing import List
from uuid import uuid4 as uuid

import pytest
from dataclasses import replace

from db import Database
from db.schema import RepositoryType
from tests.winnow.remote.helpers import make_secure_storage
from remote.model import RemoteRepository
from remote.repository_dao import RemoteRepoDAO
from remote.repository_dao_csv import CsvRemoteRepoDAO
from remote.repository_dao_database import DBRemoteRepoDAO


# NOTE: The same tests are executed for each repository storage type.


# This is an indirect fixture that receives repository dao type as an argument.
# Please see # https://docs.pytest.org/en/stable/example/parametrize.html#indirect-parametrization


@pytest.fixture
def dao(request) -> RemoteRepoDAO:
    """
    Create a new empty remote signature dao.
    """
    dao_type = request.param
    if dao_type is DBRemoteRepoDAO:
        with tempfile.TemporaryDirectory(prefix="repr-store-") as directory:
            secure_storage = make_secure_storage(directory)
            database = Database.in_memory()
            database.create_tables()
            yield DBRemoteRepoDAO(database=database, secret_storage=secure_storage)
    elif dao_type is CsvRemoteRepoDAO:
        with tempfile.TemporaryDirectory(prefix="repr-store-") as directory:
            secure_storage = make_secure_storage(directory)
            yield CsvRemoteRepoDAO(csv_file_path=os.path.join(directory, "repos.csv"), secret_storage=secure_storage)


# Shortcut for pytest parametrize decorator.
# Decorated test will be executed for each dao type.
use_repo_dao = pytest.mark.parametrize("dao", [DBRemoteRepoDAO, CsvRemoteRepoDAO], indirect=True)


def make_repo(name_infix="") -> RemoteRepository:
    """Make random repository."""
    unique_str = str(uuid())
    return RemoteRepository(
        name=f"name-{name_infix}-{unique_str}",
        address=f"address-{unique_str}",
        user=f"user-{unique_str}",
        type=RepositoryType.BARE_DATABASE,
        credentials=f"credentials-{unique_str}",
    )


def make_repos(count=10, name="") -> List[RemoteRepository]:
    """Make random repository."""
    return [make_repo(name_infix=name) for _ in range(count)]


@use_repo_dao
def test_empty(dao: RemoteRepoDAO):
    assert len(dao.list()) == 0


@use_repo_dao
def test_add(dao: RemoteRepoDAO):
    repo = make_repo()

    assert dao.get(repo.name) is None

    dao.add(repo)

    assert dao.get(repo.name) == repo
    assert dao.list() == [repo]


@use_repo_dao
def test_add_many(dao: RemoteRepoDAO):
    repos = make_repos(count=10)

    for repo in repos:
        dao.add(repo)

    assert all(dao.get(repo.name) == repo for repo in repos)
    assert set(dao.list()) == set(repos)


@use_repo_dao
def test_remove(dao: RemoteRepoDAO):
    first, second = make_repos(count=2)

    dao.add(first)
    dao.add(second)

    assert dao.get(first.name) == first
    assert dao.get(second.name) == second
    assert set(dao.list()) == {first, second}

    dao.remove(first)

    assert dao.get(first.name) is None
    assert dao.get(second.name) == second
    assert dao.list() == [second]

    dao.remove(second)

    assert dao.get(first.name) is None
    assert dao.get(second.name) is None
    assert len(dao.list()) == 0


@use_repo_dao
def test_rename(dao: RemoteRepoDAO):
    repo = make_repo()

    dao.add(repo)
    new_name = f"new-name-{uuid()}"
    dao.rename(old_name=repo.name, new_name=new_name)

    assert dao.get(repo.name) is None

    repo = replace(repo, name=new_name)
    assert dao.get(new_name) == repo
    assert dao.list() == [repo]


@use_repo_dao
def test_add_list_many(dao: RemoteRepoDAO):
    coll_size = 10
    first_coll = make_repos(count=coll_size, name="first")
    second_coll = make_repos(count=coll_size, name="second")

    for repo in first_coll + second_coll:
        dao.add(repo)

    assert set(dao.list()) == set(first_coll + second_coll)

    # Check the first repos collection
    part_1 = set(dao.list(name="first", limit=coll_size // 2))
    part_2 = set(dao.list(name="first", offset=coll_size // 2, limit=coll_size // 2))
    assert set(dao.list(name="first")) == set(first_coll)
    assert len(part_1) == len(part_2) == coll_size // 2
    assert part_1 | part_2 == set(first_coll)

    # Check the second repos collection
    assert set(dao.list(name="second")) == set(second_coll)
