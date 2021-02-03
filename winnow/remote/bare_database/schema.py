"""
This module defines database schema definition and high-level functions for bare-database fingerprint repository.
As SQLAlchemy ORM framework doesnt support upsert support, the module relies on the lower level SQLAlchemy Core API.
"""

import logging
from contextlib import contextmanager

from sqlalchemy import (
    Table,
    Column,
    Integer,
    String,
    MetaData,
    LargeBinary,
    UniqueConstraint,
    Sequence,
    create_engine,
)

# Default module logger
_logger = logging.getLogger(__name__)

# Collection of all repository database schema constructs
_metadata = MetaData()

# Unique hash per contributor constraint name
UNIQUE_FILE_CONSTRAINT_NAME = "contributor_file_unique_constraint"

# Fingerprint table
fingerprints_table = Table(
    "fingerprints",
    _metadata,
    Column("id", Integer, Sequence("fingerprints_id_seq"), primary_key=True),
    Column("sha256", String, nullable=False),
    Column("fingerprint", LargeBinary, nullable=False),
    Column("contributor", String, nullable=False),
    UniqueConstraint("contributor", "sha256", name=UNIQUE_FILE_CONSTRAINT_NAME),
)


class RepoDatabase:
    def __init__(self, url, **engine_args):
        self.engine = create_engine(url, **engine_args)
        dialect_name = self.engine.dialect.name
        if dialect_name != "postgresql":
            raise ValueError(f"Unsupported dialect: {dialect_name}. Expected: postgresql")

    @contextmanager
    def transaction(self):
        """Execute database operations in a transaction."""
        with self.engine.connect() as connection:
            with connection.begin():
                yield connection
