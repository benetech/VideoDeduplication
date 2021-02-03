from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql import func

import winnow.remote.bare_database.schema as schema
from winnow.remote.bare_database.schema import RepoDatabase


class BareDatabaseClient:
    """Bare database repository client."""

    def __init__(self, contributor_name, database_url):
        self.database = RepoDatabase(url=database_url)
        self.contributor_name = contributor_name

    def push_fingerprints(self, fingerprints):
        """Push fingerprints to the remote repository."""
        fingerprints = map(lambda pair: {"sha256": pair[0], "fingerprint": pair[1]}, fingerprints)

        with self.database.transaction() as txn:
            insert_stmt = (
                insert(schema.fingerprints_table)
                .values(fingerprints)
                .on_conflict_do_nothing(index_elements=[schema.UNIQUE_FILE_CONSTRAINT_NAME])
            )
            txn.execute(insert_stmt)

    def latest_pushed_fingerprint(self):
        """Get latest pushed fingerprint."""
        with self.database.transaction() as txn:
            select_id_stmt = select([func.max(schema.fingerprints_table.c.id)]).where(
                schema.fingerprints_table.c.contributor == self.contributor_name
            )
            latest_pushed_id = txn.execute(select_id_stmt).scalar()
            select_latest_stmt = select([schema.fingerprints_table.c.sha256]).where(
                schema.fingerprints_table.c.id == latest_pushed_id
            )
            return txn.execute(select_latest_stmt).scalar()
