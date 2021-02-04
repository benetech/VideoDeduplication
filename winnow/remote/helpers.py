"""This module offers coarse-grained helper-functions to work with remote repositories."""
import sys

from sqlalchemy import func
from sqlalchemy.orm import joinedload
from tqdm import tqdm

from db import Database
from db.schema import Files, Repository
from winnow.remote import RepositoryClient
from winnow.remote.model import LocalFingerprint
from winnow.utils.iterators import chunks


def push_database_fingerprints(database: Database, repo_client: RepositoryClient, chunk_size=1000):
    """Push all existing database fingerprints to the remote repository."""
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


def pull_fingerprints(repo: Repository, database: Database, repo_client, chunk_size=1000):
    """Pull fingerprints from remote fingerprint repository."""


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


def file_to_local_fingerprint(file: Files) -> LocalFingerprint:
    """Convert file to LocalFingerprint."""
    return LocalFingerprint(sha256=file.sha256, fingerprint=file.signature.signature)
