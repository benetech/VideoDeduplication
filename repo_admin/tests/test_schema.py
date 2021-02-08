from math import floor

import pytest

from repo_admin.bare_database.model import Role
from repo_admin.bare_database.schema import RepoDatabase
from tests.conftest import integration
from tests.helpers import names


@pytest.fixture
def database(database_uri):
    """Create repository database."""
    database = RepoDatabase(url=database_uri)
    database.drop_schema()
    database.apply_schema()
    try:
        yield database
    finally:
        database.drop_schema()


@integration
def test_initially_no_users(database: RepoDatabase):
    assert len(database.list_contributors()) == 0


@integration
def test_generate_user(database: RepoDatabase):
    role = database.create_contributor()
    assert len(role.name) > 0
    assert len(role.password) > 0
    assert database.is_contributor(role)


@integration
def test_create_user_name(database: RepoDatabase):
    requested = Role(name="some_name", password="some-pass")
    created = database.create_contributor(requested)
    assert created == requested
    assert database.is_contributor(requested)


@integration
def test_invalid_user_name(database: RepoDatabase):
    with pytest.raises(ValueError):
        database.create_contributor(Role(name="invalid %% name"))


@integration
def test_create_user_with_name_only(database: RepoDatabase):
    requested = Role(name="valid_name", password=None)
    created = database.create_contributor(requested)
    assert created.name == requested.name
    assert len(created.password) > 0
    assert database.is_contributor(requested)


@integration
def test_list_contributors(database: RepoDatabase):
    created = [database.create_contributor() for _ in range(5)]
    listed = database.list_contributors()
    assert names(listed) == names(created)


@integration
def test_delete_contributors(database: RepoDatabase):
    remained = database.create_contributor()
    deleted = database.create_contributor()
    database.delete_contributor(deleted)

    assert database.is_contributor(remained)
    assert not database.is_contributor(deleted)


@integration
def test_create_delete_list(database: RepoDatabase):
    created = [database.create_contributor() for _ in range(5)]
    deleted = created[: floor(len(created) / 2)]
    with database.transaction() as txn:
        for role in deleted:
            database.delete_contributor(role, txn)
    assert names(deleted) == names(created) - names(database.list_contributors())
