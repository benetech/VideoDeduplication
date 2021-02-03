"""This module offers coarse-grained helper-functions to work with remote repositories."""
import sys

from sqlalchemy import func
from sqlalchemy.orm import joinedload
from tqdm import tqdm

from db import Database
from db.schema import Files
from winnow.utils.iterators import chunks


def push_database_fingerprints(database: Database, repo_client, chunk_size=1000):
    """Push all existing database fingerprints to the remote repository."""
    latest_sha256 = repo_client.latest_pushed_fingerprint()
    with database.session_scope() as session:
        resume_id = _get_resume_id(session, latest_sha256)
        file_query = session.query(Files).options(joinedload(Files.signature))
        file_query = file_query.filter(Files.id >= resume_id, Files.contributor == None)
        file_query = file_query.yield_per(chunk_size)
        total_count = file_query.count()
        with tqdm(file=sys.stdout, total=total_count, unit="fingerprints") as progress:
            for files in chunks(iterable=file_query, size=chunk_size):
                fingerprints = map(_make_hash_fingerprint, files)
                repo_client.push(fingerprints)
                progress.update(len(files))


def _get_resume_id(session, latest_sha256):
    """Get file id from which to resume pushing."""
    query = session.query(func.min(Files.id))
    query = query.filter(Files.sha256 == latest_sha256)
    query = query.filter(Files.contributor == None)
    resume_id = query.scalar()
    if resume_id is None:
        return 0
    return resume_id


def _make_hash_fingerprint(file: Files):
    """Convert file to (hash, fingerprint) pair."""
    return file.sha256, file.signature.signature
