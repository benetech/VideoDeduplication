from random import randint
from typing import List
from uuid import uuid4 as uuid

import pytest

from db.schema import RepositoryType
from remote.bare_database.client import BareDatabaseClient
from remote.bare_database.schema import RepoDatabase
from remote.model import LocalFingerprint, RemoteFingerprint, RemoteRepository


@pytest.fixture
def database() -> RepoDatabase:
    """Create repository bare database."""
    return RepoDatabase.create_repo(url="sqlite://")


def make_repo(user="myself") -> RemoteRepository:
    """Create remote repository."""
    unique_str = uuid()
    return RemoteRepository(
        name=f"remote-repo-{unique_str}",
        address=f"remote-repo-addr-{unique_str}",
        user=user or f"remote-user-{unique_str}",
        type=RepositoryType.BARE_DATABASE,
        credentials=f"repo-credentials-{unique_str}",
    )


def make_local_fingerprints(count=10) -> List[LocalFingerprint]:
    fingerprint = tuple(randint(0, 100) for _ in range(10))
    return [LocalFingerprint(sha256=f"some-hash-{uuid()}", fingerprint=fingerprint) for _ in range(count)]


def as_local(remote: RemoteFingerprint) -> LocalFingerprint:
    """Convert remote fingerprint to local fingerprint."""
    return LocalFingerprint(sha256=remote.sha256, fingerprint=remote.fingerprint)


def test_empty(database: RepoDatabase):
    client = BareDatabaseClient(repository=make_repo(), repo_database=database)
    assert client.count() == 0
    assert client.latest_contribution() is None


def test_push_pull(database: RepoDatabase):
    first = BareDatabaseClient(repository=make_repo("first"), repo_database=database)
    second = BareDatabaseClient(repository=make_repo("second"), repo_database=database)

    pushed_first = make_local_fingerprints(count=10)
    pushed_second = make_local_fingerprints(count=20)
    first.push(fingerprints=pushed_first)
    second.push(fingerprints=pushed_second)

    assert first.latest_contribution() == pushed_first[-1]
    assert first.count() == len(pushed_second)

    assert second.latest_contribution() == pushed_second[-1]
    assert second.count() == len(pushed_first)

    pulled_first = first.pull(limit=len(pushed_first) + len(pushed_second))

    assert len(pulled_first) == len(pushed_second)
    assert all(remote.contributor == second.repository.user for remote in pulled_first)
    assert set(map(as_local, pulled_first)) == set(pushed_second)

    pulled_second = second.pull(limit=len(pushed_first) + len(pushed_second))

    assert len(pulled_second) == len(pushed_first)
    assert all(remote.contributor == first.repository.user for remote in pulled_second)
    assert set(map(as_local, pulled_second)) == set(pushed_first)


def test_push_parts(database: RepoDatabase):
    first = BareDatabaseClient(repository=make_repo("first"), repo_database=database)
    second = BareDatabaseClient(repository=make_repo("second"), repo_database=database)

    pushed_first = make_local_fingerprints(count=10)
    first.push(fingerprints=pushed_first)

    first_part = second.pull(limit=len(pushed_first) // 2)
    second_part = second.pull(start_from=first_part[-1].id, limit=len(pushed_first) - len(first_part))

    assert len(first_part) == len(pushed_first) // 2
    assert len(second_part) == len(pushed_first) - len(first_part)
    assert set(map(as_local, first_part)) == set(pushed_first[0 : len(pushed_first) // 2])
    assert set(map(as_local, second_part)) == set(pushed_first[len(pushed_first) // 2 :])


def test_push_conflict(database: RepoDatabase):
    first = BareDatabaseClient(repository=make_repo("first"), repo_database=database)
    second = BareDatabaseClient(repository=make_repo("second"), repo_database=database)

    pushed_first = make_local_fingerprints(count=10)
    first.push(fingerprints=pushed_first)
    first.push(fingerprints=pushed_first)

    pulled_second = second.pull(limit=len(pushed_first) * 2)

    assert len(pulled_second) == len(pushed_first)
    assert set(map(as_local, pulled_second)) == set(pushed_first)
