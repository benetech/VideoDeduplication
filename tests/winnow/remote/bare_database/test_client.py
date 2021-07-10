from random import randint
from typing import List
from uuid import uuid4 as uuid

import pytest
from dataclasses import astuple

from winnow.remote.bare_database.client import BareDatabaseClient
from winnow.remote.bare_database.schema import RepoDatabase
from winnow.remote.model import RepositoryClient, LocalFingerprint, RemoteFingerprint


@pytest.fixture
def repo() -> RepoDatabase:
    """Create repository bare database."""
    return RepoDatabase.create_repo(url="sqlite://")


@pytest.fixture
def client(repo: RepoDatabase) -> BareDatabaseClient:
    """Create bare database client."""
    return BareDatabaseClient(contributor_name="myself", repo_database=repo)


def make_local_fingerprints(count=10) -> List[LocalFingerprint]:
    fingerprint = tuple(randint(0, 100) for _ in range(10))
    return [LocalFingerprint(sha256=f"some-hash-{uuid()}", fingerprint=fingerprint) for _ in range(count)]


def as_local(remote: RemoteFingerprint) -> LocalFingerprint:
    """Convert remote fingerprint to local fingerprint."""
    return LocalFingerprint(sha256=remote.sha256, fingerprint=remote.fingerprint)


def test_empty(client: RepositoryClient):
    assert client.count() == 0
    assert client.latest_contribution() is None


def test_push_pull(repo: RepoDatabase):
    first = BareDatabaseClient(contributor_name="first", repo_database=repo)
    second = BareDatabaseClient(contributor_name="second", repo_database=repo)

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
    assert all(remote.contributor == second.contributor_name for remote in pulled_first)
    assert set(map(astuple, map(as_local, pulled_first))) == set(map(astuple, pushed_second))

    pulled_second = second.pull(limit=len(pushed_first) + len(pushed_second))

    assert len(pulled_second) == len(pushed_first)
    assert all(remote.contributor == first.contributor_name for remote in pulled_second)
    assert set(map(astuple, map(as_local, pulled_second))) == set(map(astuple, pushed_first))


def test_push_parts(repo: RepoDatabase):
    first = BareDatabaseClient(contributor_name="first", repo_database=repo)
    second = BareDatabaseClient(contributor_name="second", repo_database=repo)

    pushed_first = make_local_fingerprints(count=10)
    first.push(fingerprints=pushed_first)

    first_part = second.pull(limit=len(pushed_first) // 2)
    second_part = second.pull(start_from=first_part[-1].id, limit=len(pushed_first) - len(first_part))

    assert len(first_part) == len(pushed_first) // 2
    assert len(second_part) == len(pushed_first) - len(first_part)
    assert set(map(astuple, map(as_local, first_part))) == set(map(astuple, pushed_first[0 : len(pushed_first) // 2]))
    assert set(map(astuple, map(as_local, second_part))) == set(map(astuple, pushed_first[len(pushed_first) // 2 :]))


def test_push_conflict(repo: RepoDatabase):
    first = BareDatabaseClient(contributor_name="first", repo_database=repo)
    second = BareDatabaseClient(contributor_name="second", repo_database=repo)

    pushed_first = make_local_fingerprints(count=10)
    first.push(fingerprints=pushed_first)
    first.push(fingerprints=pushed_first)

    pulled_second = second.pull(limit=len(pushed_first) * 2)

    assert len(pulled_second) == len(pushed_first)
    assert set(map(astuple, map(as_local, pulled_second))) == set(map(astuple, pushed_first))
