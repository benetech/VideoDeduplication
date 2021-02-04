from typing import Iterable, List, Optional

from dataclasses import asdict
from sqlalchemy import select
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

    def pull(self) -> List[RemoteFingerprint]:
        """Fetch fingerprints from the remote repository."""

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
