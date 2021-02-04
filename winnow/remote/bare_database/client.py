from typing import Iterable, List, Optional

from dataclasses import asdict
from sqlalchemy import select, asc
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql import func

from .schema import RepoDatabase, fingerprints_table
from ..model import LocalFingerprint, RemoteFingerprint, RepositoryClient


class BareDatabaseClient(RepositoryClient):
    """Bare database repository client."""

    def __init__(self, contributor_name, database_url):
        self.database = RepoDatabase(url=database_url)
        self.contributor_name = contributor_name

    def push(self, fingerprints: Iterable[LocalFingerprint]):
        """Push fingerprints to the remote repository."""
        fingerprints = tuple(map(asdict, fingerprints))

        with self.database.transaction() as txn:
            insert_stmt = insert(fingerprints_table).values(fingerprints).on_conflict_do_nothing()
            txn.execute(insert_stmt)

    def pull(self, start_from: int, limit: int = 1000) -> List[RemoteFingerprint]:
        """Fetch fingerprints from the remote repository.

        Args:
            start_from (int): external fingerprint id (within remote repo) from which to start pulling.
            limit (int): maximal number of fingerprints to pull at once. Must be between 0 and 10000.
        """
        if not (0 <= limit <= 10000):
            raise ValueError(f"Limit must be from [0, 10000]. Given: {limit}")
        with self.database.transaction() as txn:
            select_statement = (
                select(
                    [
                        fingerprints_table.c.id,
                        fingerprints_table.c.sha256,
                        fingerprints_table.c.fingerprint,
                        fingerprints_table.c.contributor,
                    ]
                )
                .where(
                    fingerprints_table.c.id > start_from,
                    fingerprints_table.c.contributor != self.contributor_name,
                )
                .order_by(asc(fingerprints_table.c.id))
                .limit(limit)
            )
            results = txn.execute(select_statement)
            return list(map(self._make_remote_fp, results))

    def _make_remote_fp(self, record):
        """Convert database record to remote fingerprint record."""
        return RemoteFingerprint(id=record[0], sha256=record[1], fingerprint=record[2], contributor=record[3])

    def latest_contribution(self) -> Optional[LocalFingerprint]:
        """Get the latest local fingerprint pushed to this repository."""
        with self.database.transaction() as txn:
            select_id_stmt = select([func.max(fingerprints_table.c.id)]).where(
                fingerprints_table.c.contributor == self.contributor_name
            )
            latest_pushed_id = txn.execute(select_id_stmt).scalar()
            select_latest_stmt = select([fingerprints_table.c.sha256, fingerprints_table.c.fingerprint]).where(
                fingerprints_table.c.id == latest_pushed_id
            )
            record = txn.execute(select_latest_stmt).first()
            if record is None:
                return None
            return LocalFingerprint(sha256=record[0], fingerprint=record[1])

    def count(self, start_from: int) -> int:
        """Get count of fingerprint with id greater than the given one."""
        with self.database.transaction() as txn:
            statement = select([func.count(fingerprints_table.c.id)]).where(
                fingerprints_table.c.id > start_from,
                fingerprints_table.c.contributor != self.contributor_name,
            )
            return txn.execute(statement).scalar()
