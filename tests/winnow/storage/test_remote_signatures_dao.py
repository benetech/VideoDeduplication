import os
import pickle
import tempfile
from random import randint, uniform
from typing import List, Iterable
from uuid import uuid4 as uuid

import pandas as pd
import pytest
from dataclasses import dataclass, replace

from db import Database
from db.schema import RepositoryType, Files, Matches
from remote.model import RemoteRepository, RemoteFingerprint
from remote.repository_dao import RemoteRepoDAO
from remote.repository_dao_csv import CsvRemoteRepoDAO
from remote.repository_dao_database import DBRemoteRepoDAO
from tests.winnow.remote.helpers import make_secure_storage
from winnow.storage.file_key import FileKey
from winnow.storage.remote_signatures_dao import (
    DBRemoteSignaturesDAO,
    ReprRemoteSignaturesDAO,
    RemoteSignaturesDAO,
    RemoteMatch,
)


# NOTE: The same tests are executed for each signatures storage type.


# This is an indirect fixture that receives storage type as an argument.
# Please see # https://docs.pytest.org/en/stable/example/parametrize.html#indirect-parametrization


@dataclass
class Fixture:
    repos_dao: RemoteRepoDAO
    signatures_dao: RemoteSignaturesDAO

    def save_local(self, *file_keys):
        raise NotImplementedError()

    def read_remote_matches(self) -> List[RemoteMatch]:
        """Read all known remote matches."""
        raise NotImplementedError()


@dataclass
class DBFixture(Fixture):
    database: Database

    def save_local(self, *file_keys):
        with self.database.session_scope() as session:
            for key in file_keys:
                file = Files(file_path=key.path, sha256=key.hash)
                session.add(file)

    def read_remote_matches(self) -> List[RemoteMatch]:
        """Read all known remote matches."""
        results = []
        with self.database.session_scope() as session:
            matches = session.query(Matches)
            matches = matches.filter(Matches.query_video_file.has(Files.external_id != None))  # noqa: E711
            for match in matches:
                match = RemoteMatch(
                    remote=RemoteFingerprint(
                        id=match.query_video_file.external_id,
                        fingerprint=pickle.loads(match.query_video_file.signature.signature),
                        repository=match.query_video_file.contributor.repository.name,
                        contributor=match.query_video_file.contributor.name,
                        sha256=match.query_video_file.sha256,
                    ),
                    local=FileKey(
                        path=match.match_video_file.file_path,
                        hash=match.match_video_file.sha256,
                    ),
                    distance=match.distance,
                )
                results.append(normalize_match(match))
        return results


@dataclass
class ReprFixture(Fixture):
    output_directory: str

    def save_local(self, *file_keys):
        pass

    def read_remote_matches(self) -> List[RemoteMatch]:
        output_file_names = os.listdir(self.output_directory)
        if not output_file_names:
            return []
        output_file = os.path.join(self.output_directory, output_file_names[-1])

        results = []
        for entry in pd.read_csv(output_file).to_dict(orient="records"):
            match = RemoteMatch(
                remote=self.signatures_dao.get_signature(
                    repository_name=entry["remote_repository"],
                    contributor_name=entry["remote_contributor"],
                    sha256=entry["remote_sha256"],
                ),
                local=FileKey(
                    path=entry["local_path"],
                    hash=entry["local_sha256"],
                ),
                distance=entry["distance"],
            )
            results.append(normalize_match(match))
        return results


def make_db_fixture(directory) -> DBFixture:
    database = Database.in_memory(echo=False)
    database.create_tables()
    secure_storage = make_secure_storage(directory)
    database = Database.in_memory()
    database.create_tables()
    return DBFixture(
        database=database,
        repos_dao=DBRemoteRepoDAO(database=database, secret_storage=secure_storage),
        signatures_dao=DBRemoteSignaturesDAO(database),
    )


def make_repr_fixture(directory) -> ReprFixture:
    output_directory = os.path.join(directory, "output")
    os.makedirs(output_directory)
    return ReprFixture(
        output_directory=output_directory,
        repos_dao=CsvRemoteRepoDAO(
            csv_file_path=os.path.join(directory, "repos.csv"),
            secret_storage=make_secure_storage(directory),
        ),
        signatures_dao=ReprRemoteSignaturesDAO(
            root_directory=directory,
            output_directory=output_directory,
        ),
    )


@pytest.fixture
def fixture(request):
    """
    Create a new empty remote signature dao.
    """
    dao_type = request.param
    if dao_type is DBRemoteSignaturesDAO:
        with tempfile.TemporaryDirectory(prefix="remote-sig-tests-") as directory:
            yield make_db_fixture(directory)
    elif dao_type is ReprRemoteSignaturesDAO:
        with tempfile.TemporaryDirectory(prefix="remote-sig-tests-") as directory:
            yield make_repr_fixture(directory)


# Shortcut for pytest parametrize decorator.
# Decorated test will be executed for each dao type.
use_signautres_dao = pytest.mark.parametrize("fixture", [DBRemoteSignaturesDAO, ReprRemoteSignaturesDAO], indirect=True)


@pytest.fixture
def db_fixture():
    """Create database fixture."""
    with tempfile.TemporaryDirectory(prefix="remote-sig-tests-") as directory:
        yield make_db_fixture(directory)


@pytest.fixture
def repr_fixture():
    with tempfile.TemporaryDirectory(prefix="remote-sig-tests-") as directory:
        yield make_repr_fixture(directory)


def make_repo(name: str = None) -> RemoteRepository:
    unique_str = uuid()
    return RemoteRepository(
        name=name or f"repo-name-{unique_str}",
        address=f"repo-addr-{unique_str}",
        user=f"repo-user-{unique_str}",
        type=RepositoryType.BARE_DATABASE,
        credentials=f"repo-credentials-{unique_str}",
    )


def make_signature(repo: RemoteRepository, signature_id: int = 0, contributor: str = None) -> RemoteFingerprint:
    return RemoteFingerprint(
        id=signature_id,
        fingerprint=tuple(randint(0, 100) for _ in range(10)),
        sha256=f"sha256-{uuid()}",
        contributor=contributor or f"contributor-{uuid()}",
        repository=repo.name,
    )


def make_signatures(
    repo: RemoteRepository = None,
    count: int = 10,
    start_id: int = 0,
    contributor: str = None,
) -> List[RemoteFingerprint]:
    """Create a collection of remote signatures from the same repo."""
    repo = repo or make_repo()
    return [make_signature(repo=repo, signature_id=start_id + i, contributor=contributor) for i in range(count)]


def make_local() -> FileKey:
    unique_str = uuid()
    return FileKey(path=f"local/path/{unique_str}", hash=f"some-hash-{unique_str}")


def make_locals(count=10) -> List[FileKey]:
    return [make_local() for _ in range(count)]


def make_matches(remote_sigs, local_files) -> List[RemoteMatch]:
    """Create pairwise matches."""
    return [
        normalize_match(RemoteMatch(remote, local, uniform(0.5, 1.0)))
        for remote, local in zip(remote_sigs, local_files)
    ]


def normalize_sig(signature: RemoteFingerprint) -> RemoteFingerprint:
    """Convert fingerprint value to tuple."""
    return replace(signature, fingerprint=tuple(signature.fingerprint))


def normalize_match(match: RemoteMatch) -> RemoteMatch:
    """Normalize remote match to be able to compare them."""
    return replace(match, remote=normalize_sig(match.remote), distance=round(match.distance, 4))


def as_set(signatures: Iterable[RemoteFingerprint]) -> set:
    """Convert collection of remote signatures to a set."""
    return set(normalize_sig(sig) for sig in signatures)


@use_signautres_dao
def test_empty(fixture: Fixture):
    assert fixture.signatures_dao.count() == 0
    assert list(fixture.signatures_dao.query_signatures()) == []
    assert list(fixture.read_remote_matches()) == []


@use_signautres_dao
def test_get_signature(fixture: Fixture):
    repo = make_repo()
    remote_sig = make_signature(repo)

    fixture.repos_dao.add(repo)
    fixture.signatures_dao.save_signatures([remote_sig])

    loaded_sig = fixture.signatures_dao.get_signature(
        repository_name=repo.name,
        contributor_name=remote_sig.contributor,
        sha256=remote_sig.sha256,
    )

    assert normalize_sig(loaded_sig) == remote_sig


@use_signautres_dao
def test_save_query_basic(fixture: Fixture):
    repo = make_repo()
    remote_signatures = make_signatures(repo, count=10)

    fixture.repos_dao.add(repo)
    fixture.signatures_dao.save_signatures(remote_signatures)

    assert as_set(fixture.signatures_dao.query_signatures()) == as_set(remote_signatures)


@use_signautres_dao
def test_save_query_filters(fixture: Fixture):
    repos_dao, signatures_dao = fixture.repos_dao, fixture.signatures_dao

    # Generate remote signatures
    repo_1, repo_2 = make_repo(), make_repo()
    contrib_1, contrib_2 = "first", "second"
    sigs_1_1 = make_signatures(repo_1, contributor=contrib_1, count=10)
    sigs_1_2 = make_signatures(repo_1, contributor=contrib_2, count=10)
    sigs_2_1 = make_signatures(repo_2, contributor=contrib_1, count=10)
    sigs_2_2 = make_signatures(repo_2, contributor=contrib_2, count=10)

    # Save signatures
    repos_dao.add(repo_1)
    repos_dao.add(repo_2)
    signatures_dao.save_signatures(sigs_1_1)
    signatures_dao.save_signatures(sigs_1_2)
    signatures_dao.save_signatures(sigs_2_1)
    signatures_dao.save_signatures(sigs_2_2)

    # Query by repo
    assert as_set(signatures_dao.query_signatures(repository_name=repo_1.name)) == as_set(sigs_1_1 + sigs_1_2)
    assert as_set(signatures_dao.query_signatures(repository_name=repo_2.name)) == as_set(sigs_2_1 + sigs_2_2)

    # Query by contrib
    assert as_set(signatures_dao.query_signatures(contributor_name=contrib_1)) == as_set(sigs_1_1 + sigs_2_1)
    assert as_set(signatures_dao.query_signatures(contributor_name=contrib_2)) == as_set(sigs_1_2 + sigs_2_2)

    # Query by repo and contrib
    assert as_set(signatures_dao.query_signatures(repo_1.name, contrib_1)) == as_set(sigs_1_1)
    assert as_set(signatures_dao.query_signatures(repo_1.name, contrib_2)) == as_set(sigs_1_2)
    assert as_set(signatures_dao.query_signatures(repo_2.name, contrib_1)) == as_set(sigs_2_1)
    assert as_set(signatures_dao.query_signatures(repo_2.name, contrib_2)) == as_set(sigs_2_2)


@use_signautres_dao
def test_count(fixture: Fixture):
    repos_dao, signatures_dao = fixture.repos_dao, fixture.signatures_dao

    # Generate remote signatures
    repo_1, repo_2 = make_repo(), make_repo()
    contrib_1, contrib_2 = "first", "second"
    sigs_1_1 = make_signatures(repo_1, contributor=contrib_1, count=10)
    sigs_1_2 = make_signatures(repo_1, contributor=contrib_2, count=11)
    sigs_2_1 = make_signatures(repo_2, contributor=contrib_1, count=12)
    sigs_2_2 = make_signatures(repo_2, contributor=contrib_2, count=13)

    # Save signatures
    repos_dao.add(repo_1)
    repos_dao.add(repo_2)
    signatures_dao.save_signatures(sigs_1_1)
    signatures_dao.save_signatures(sigs_1_2)
    signatures_dao.save_signatures(sigs_2_1)
    signatures_dao.save_signatures(sigs_2_2)

    # Count all
    assert signatures_dao.count() == len(sigs_1_1) + len(sigs_1_2) + len(sigs_2_1) + len(sigs_2_2)

    # Count by repo
    assert signatures_dao.count(repository_name=repo_1.name) == len(sigs_1_1) + len(sigs_1_2)
    assert signatures_dao.count(repository_name=repo_2.name) == len(sigs_2_1) + len(sigs_2_2)

    # Count by contrib
    assert signatures_dao.count(contributor_name=contrib_1) == len(sigs_1_1) + len(sigs_2_1)
    assert signatures_dao.count(contributor_name=contrib_2) == len(sigs_1_2) + len(sigs_2_2)

    # Count by repo and contrib
    assert signatures_dao.count(repo_1.name, contrib_1) == len(sigs_1_1)
    assert signatures_dao.count(repo_1.name, contrib_2) == len(sigs_1_2)
    assert signatures_dao.count(repo_2.name, contrib_1) == len(sigs_2_1)
    assert signatures_dao.count(repo_2.name, contrib_2) == len(sigs_2_2)


# FIXME: Fix broken tests #476

# @use_signautres_dao
# def test_save_matches_db(fixture: Fixture):
#     repos_dao, signguantures_dao = fixture.repos_dao, fixture.signatures_dao
#
#     # Generate test data
#     repo = make_repo()
#     remote_sigs = make_signatures(repo, count=10)
#     local_files = make_locals(count=len(remote_sigs))
#     matches = make_matches(remote_sigs, local_files)
#
#     # Save test data
#     repos_dao.add(repo)
#     signguantures_dao.save_signatures(remote_sigs)
#     fixture.save_local(*local_files)
#     signguantures_dao.save_matches(matches)
#
#     assert set(fixture.read_remote_matches()) == set(matches)
