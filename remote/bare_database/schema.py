"""
This module defines database schema definition and high-level functions for bare-database fingerprint repository.
As SQLAlchemy ORM framework doesnt support upsert support, the module relies on the lower level SQLAlchemy Core API.
"""

import logging
from contextlib import contextmanager

import sqlalchemy.dialects.postgresql as psql
import sqlalchemy.dialects.sqlite as sqlite
import sqlalchemy.sql.expression as sql
from cached_property import cached_property
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

# Fingerprint table
fingerprints_table = Table(
    "fingerprints",
    _metadata,
    Column("id", Integer, Sequence("fingerprints_id_seq"), primary_key=True),
    Column("sha256", String, nullable=False),
    Column("fingerprint", LargeBinary, nullable=False),
    Column("contributor", String, nullable=False),
    UniqueConstraint("contributor", "sha256", name="contributor_file_unique_constraint"),
)


class RepoDatabase:
    @staticmethod
    def create_repo(url, **engine_args):
        """Create repository and apply database schema. This is useful for testing purpose."""
        repo = RepoDatabase(url, **engine_args)
        _metadata.create_all(bind=repo.engine)
        return repo

    def __init__(self, url, **engine_args):
        self.engine = create_engine(url, **engine_args)

    @cached_property
    def dialect(self):
        """Get appropriate dialect-specific sql statement factory."""
        if isinstance(self.engine.dialect, psql.dialect):
            return psql
        elif isinstance(self.engine.dialect, sqlite.dialect):
            return sqlite
        else:
            return sql

    @contextmanager
    def transaction(self):
        """Execute database operations in a transaction."""
        with self.engine.connect() as connection:
            with connection.begin():
                yield connection
