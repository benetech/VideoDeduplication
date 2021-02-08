from contextlib import contextmanager
from urllib.parse import quote
from uuid import uuid4 as uuid

from dataclasses import asdict, dataclass
from sqlalchemy import create_engine

from repo_admin.bare_database.model import Role
from repo_admin.bare_database.schema import RepoDatabase, fingerprints_table as table


def names(roles):
    """Get role names."""
    return set(role.name for role in roles)


def connect_as(database: RepoDatabase, role: Role, **engine_args):
    """Connect to the database using the given role. Return engine."""
    url = database.engine.url
    new_url = f"{url.drivername}://{role.name}:{quote(role.password, safe='')}@{url.host}:{url.port}/{url.database}"
    return create_engine(new_url, **engine_args)


@dataclass
class Record:
    """Fingerprint table record."""

    id: int = None
    sha256: str = None
    fingerprint: bytes = None
    contributor: str = None

    @staticmethod
    def make_one(user):
        return Record(sha256=str(uuid()), fingerprint=bytes(str(uuid()), encoding="utf-8"), contributor=user)

    @staticmethod
    def make(user, count):
        return [Record.make_one(user) for _ in range(count)]

    @staticmethod
    def from_query(query_results):
        return [Record(**dict(entry)) for entry in query_results]

    @staticmethod
    def get(records, user):
        return [record for record in records if record.contributor == user]

    @staticmethod
    def first(query_results):
        first, *_ = Record.from_query(query_results)
        return first

    def file(self):
        """Get file attributes."""
        return self.sha256, self.fingerprint

    def dict(self):
        """Convert to dict."""
        return {key: value for key, value in asdict(self).items() if value is not None}


@contextmanager
def transaction(engine):
    """Create a transaction."""
    with engine.connect() as connection:
        with connection.begin():
            yield connection


def insert_one(conn, user):
    with transaction(conn) as txn:
        inserted = Record.make_one(user=user)
        txn.execute(table.insert(values=inserted.dict()))
    return inserted


def select_one(conn):
    with transaction(conn) as txn:
        query_results = txn.execute(table.select())
        selected = Record.first(query_results)
    return selected


def insert_many(conn, user, count=10):
    with transaction(conn) as txn:
        inserted = Record.make(user=user, count=count)
        for record in inserted:
            txn.execute(table.insert(values=record.dict()))
    return inserted


def select_all(conn):
    with transaction(conn) as txn:
        results = txn.execute(table.select())
        return Record.from_query(results)


def delete_all(conn):
    with transaction(conn) as txn:
        txn.execute(table.delete())


def files(records):
    return set(record.file() for record in records)
