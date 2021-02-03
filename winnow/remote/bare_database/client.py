from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql import func

from .schema import RepoDatabase, fingerprints_table


class BareDatabaseClient:
    """Bare database repository client."""

    def __init__(self, contributor_name, database_url):
        self.database = RepoDatabase(url=database_url)
        self.contributor_name = contributor_name

    def push(self, fingerprints):
        """Push fingerprints to the remote repository."""
        fingerprints = tuple(map(lambda pair: {"sha256": pair[0], "fingerprint": pair[1]}, fingerprints))

        with self.database.transaction() as txn:
            insert_stmt = insert(fingerprints_table).values(fingerprints).on_conflict_do_nothing()
            txn.execute(insert_stmt)

    def latest_pushed_fingerprint(self):
        """Get latest pushed fingerprint."""
        with self.database.transaction() as txn:
            select_id_stmt = select([func.max(fingerprints_table.c.id)]).where(
                fingerprints_table.c.contributor == self.contributor_name
            )
            latest_pushed_id = txn.execute(select_id_stmt).scalar()
            select_latest_stmt = select([fingerprints_table.c.sha256]).where(
                fingerprints_table.c.id == latest_pushed_id
            )
            return txn.execute(select_latest_stmt).scalar()
