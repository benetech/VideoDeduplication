"""This module offers coarse-grained helper-functions to work with remote repositories."""
import math
import sys
from typing import Iterable

from sqlalchemy import func, tuple_
from sqlalchemy.orm import joinedload
from tqdm import tqdm

from db import Database
from db.schema import Files, Repository, Contributor, Signature
from winnow.remote import RepositoryClient
from winnow.remote.model import LocalFingerprint, RemoteFingerprint
from winnow.utils.iterators import chunks


def push_database_fingerprints(database: Database, repo_client: RepositoryClient, chunk_size=1000):
    """Push all fingerprints from the local database to the remote repository."""
    with database.session_scope() as session:
        resume_id = _get_push_resume_id(session, repo_client)
        file_query = session.query(Files).options(joinedload(Files.signature))
        file_query = file_query.filter(Files.id >= resume_id, Files.contributor == None)  # noqa: E711
        file_query = file_query.yield_per(chunk_size)
        total_count = file_query.count()
        with tqdm(file=sys.stdout, total=total_count, unit="fingerprints") as progress:
            for files in chunks(iterable=file_query, size=chunk_size):
                fingerprints = map(file_to_local_fingerprint, files)
                repo_client.push(fingerprints)
                progress.update(len(files))


def pull_fingerprints_to_database(repo: Repository, database: Database, repo_client: RepositoryClient, chunk_size=1000):
    """Pull fingerprints from remote repository and store them in a local database."""
    latest_pulled_id = _get_latest_pulled_fingerprint_id(database, repo)
    remaining_count = repo_client.count(start_from=latest_pulled_id)
    with tqdm(file=sys.stdout, total=remaining_count, unit="fingerprints") as progress:
        iterations = math.ceil(float(remaining_count) / chunk_size)
        for _ in range(iterations):
            fingerprints = repo_client.pull(start_from=latest_pulled_id, limit=min(chunk_size, remaining_count))
            latest_pulled_id = max(map(lambda fingerprint: fingerprint.id, fingerprints))
            remaining_count -= len(fingerprints)
            with database.session_scope() as session:
                store_remote_fingerprints_to_database(session=session, repo=repo, fingerprints=fingerprints)
            progress.update(len(fingerprints))


def _get_push_resume_id(session, repo_client: RepositoryClient):
    """Get file id from which to resume pushing."""
    latest = repo_client.latest_contribution()
    if latest is None:
        return 0
    query = session.query(func.min(Files.id))
    query = query.filter(Files.sha256 == latest.sha256)
    query = query.filter(Files.contributor == None)  # noqa: E711
    resume_id = query.scalar()
    if resume_id is None:
        return 0
    return resume_id


def _get_latest_pulled_fingerprint_id(database: Database, repo: Repository) -> int:
    """Get latest file from the local database that was pulled from the given repository."""
    with database.session_scope() as session:
        query = session.query([func.max(Files.external_id)])
        query = query.filter(Files.contributor.has(Contributor.repository == repo))
        latest_pulled_id = query.scalar()
        if latest_pulled_id is None:
            return 0
        return latest_pulled_id


def store_remote_fingerprints_to_database(session, repo: Repository, fingerprints: Iterable[RemoteFingerprint]):
    """Store remote fingerprints to the local database."""
    contributors = _get_or_create_contributors(session, repo, fingerprints)
    for fingerprint in fingerprints:
        file = Files(
            sha256=fingerprint.sha256,
            contributor=contributors[fingerprint.contributor],
            external_id=fingerprint.id,
        )
        signature = Signature(signature=fingerprint.fingerprint, file=file)
        session.add(file)
        session.add(signature)


def _get_or_create_contributors(session, repo: Repository, fingerprints: Iterable[RemoteFingerprint]):
    """Get or create fingerprint contributors."""
    contributor_names = set(fingerprint.contributor for fingerprint in fingerprints)
    existing_contributors = (
        session.query(Contributor)
        .filter(
            Contributor.repository == repo,
            tuple_(Contributor.name).in_(contributor_names),
        )
        .all()
    )
    existing_names = set(contributor.name for contributor in existing_contributors)
    remaining_names = contributor_names - existing_names
    new_contributors = [Contributor(name=name, repository=repo) for name in remaining_names]
    session.add_all(new_contributors)
    return {contributor.name: contributor for contributor in (existing_contributors + new_contributors)}


def file_to_local_fingerprint(file: Files) -> LocalFingerprint:
    """Convert file to LocalFingerprint."""
    return LocalFingerprint(sha256=file.sha256, fingerprint=file.signature.signature)
