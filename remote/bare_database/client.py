import pickle
from typing import Iterable, List, Optional, Sequence

from dataclasses import asdict
from sqlalchemy import select, asc
from sqlalchemy.sql import func

from .schema import RepoDatabase, fingerprints_table
from ..model import (
    LocalFingerprint,
    RemoteFingerprint,
    RepositoryClient,
    RemoteRepository,
    RepositoryStats,
    ContributorStats,
)


class BareDatabaseClient(RepositoryClient):
    """Bare database repository client."""

    def __init__(self, repository: RemoteRepository, repo_database: RepoDatabase = None):
        self._repository: RemoteRepository = repository
        self._database: RepoDatabase = repo_database or RepoDatabase(repository.credentials)

    @property
    def repository(self) -> RemoteRepository:
        """Get the repository that the client communicates with."""
        return self._repository

    def push(self, fingerprints: Iterable[LocalFingerprint]):
        """Push fingerprints to the remote repository."""
        fingerprints = tuple(map(self._local_fp_asdict, fingerprints))

        with self._database.transaction() as txn:
            dialect = self._database.dialect
            insert_stmt = dialect.insert(fingerprints_table).values(fingerprints)
            if hasattr(insert_stmt, "on_conflict_do_nothing"):
                insert_stmt = insert_stmt.on_conflict_do_nothing()
            txn.execute(insert_stmt)

    def pull(self, start_from: int = 0, limit: int = 10000) -> List[RemoteFingerprint]:
        """Fetch fingerprints from the remote repository.

        Args:
            start_from (int): external fingerprint id (within remote repo) from which to start pulling.
            limit (int): maximal number of fingerprints to pull at once.
        """
        if limit <= 0:
            raise ValueError(f"Limit must be > 0. Given: {limit}")
        with self._database.transaction() as txn:
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
                    (fingerprints_table.c.id > start_from) & (fingerprints_table.c.contributor != self.repository.user),
                )
                .order_by(asc(fingerprints_table.c.id))
                .limit(limit)
            )
            results = txn.execute(select_statement)
            return list(map(self._make_remote_fp, results))

    def _make_remote_fp(self, record):
        """Convert database record to remote fingerprint record."""
        return RemoteFingerprint(
            id=record[0],
            sha256=record[1],
            fingerprint=self._load_fingerprint(record[2]),
            contributor=record[3],
            repository=self.repository.name,
        )

    def _local_fp_asdict(self, fingerprint: LocalFingerprint):
        """Convert local fingerprint to a dict that could be directly used to store in a remote database."""
        result = asdict(fingerprint)
        result["contributor"] = self.repository.user
        result["fingerprint"] = self._dump_fingerprint(fingerprint.fingerprint)
        return result

    def _dump_fingerprint(self, fingerprint: Sequence[float]) -> bytes:
        """Convert fingerprint as float vector into bytes."""
        return pickle.dumps(fingerprint)

    def _load_fingerprint(self, fingerprint: bytes) -> Sequence[float]:
        """Restore fingerprint from serialized bytes."""
        return pickle.loads(fingerprint)

    def latest_contribution(self) -> Optional[LocalFingerprint]:
        """Get the latest local fingerprint pushed to this repository."""
        with self._database.transaction() as txn:
            select_id_stmt = select([func.max(fingerprints_table.c.id)]).where(
                fingerprints_table.c.contributor == self.repository.user
            )
            latest_pushed_id = txn.execute(select_id_stmt).scalar()
            select_latest_stmt = select([fingerprints_table.c.sha256, fingerprints_table.c.fingerprint]).where(
                fingerprints_table.c.id == latest_pushed_id
            )
            record = txn.execute(select_latest_stmt).first()
            if record is None:
                return None
            return LocalFingerprint(sha256=record[0], fingerprint=self._load_fingerprint(record[1]))

    def count(self, start_from: int = 0, contributor: str = None) -> int:
        """Get count of fingerprint with id greater than the given one."""
        with self._database.transaction() as txn:
            has_wanted_id = fingerprints_table.c.id > start_from
            pushed_by_others = fingerprints_table.c.contributor != self.repository.user
            condition = has_wanted_id & pushed_by_others
            if contributor is not None:
                pushed_by_wanted_contributor = fingerprints_table.c.contributor == contributor
                condition = has_wanted_id & pushed_by_wanted_contributor
            statement = select([func.count(fingerprints_table.c.id)]).where(condition)
            return txn.execute(statement).scalar()

    def _contributors(self) -> List[ContributorStats]:
        """Get all contributors."""
        with self._database.transaction() as txn:
            statement = select([fingerprints_table.c.contributor, func.count(fingerprints_table.c.id)]).group_by(
                fingerprints_table.c.contributor
            )
            results = txn.execute(statement)
            return [ContributorStats(name=record[0], fingerprints_count=record[1]) for record in results]

    def get_stats(self) -> RepositoryStats:
        """Get repository info."""
        return RepositoryStats(
            repo=self.repository,
            total_count=self.count(),
            pushed_count=self.count(contributor=self.repository.user),
            contributors=self._contributors(),
        )
