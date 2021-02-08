from math import floor

import pytest

from repo_admin.bare_database.model import Role
from repo_admin.bare_database.schema import RepoDatabase
from tests.conftest import integration
from tests.helpers import connect_as, insert_one, select_one, insert_many, select_all, files, Record, delete_all, names


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


@integration
def test_insert_correct_name(database: RepoDatabase):
    role = database.create_contributor()
    conn = connect_as(database, role)
    inserted = insert_one(conn, user=role.name)
    selected = select_one(conn)

    assert inserted.file() == selected.file()
    assert selected.contributor == role.name


@integration
def test_insert_unknown_name(database: RepoDatabase):
    role = database.create_contributor()
    conn = connect_as(database, role)
    inserted = insert_one(conn, user="unknown")
    selected = select_one(conn)

    assert inserted.file() == selected.file()
    assert selected.contributor == role.name


@integration
def test_insert_wrong_existing_name(database: RepoDatabase):
    correct = database.create_contributor()
    wrong = database.create_contributor()
    conn = connect_as(database, role=correct)
    inserted = insert_one(conn, user=wrong.name)
    selected = select_one(conn)

    assert inserted.file() == selected.file()
    assert selected.contributor == correct.name


@integration
def test_read_others(database: RepoDatabase):
    writer = database.create_contributor()
    reader = database.create_contributor()
    as_writer = connect_as(database, role=writer)
    as_reader = connect_as(database, role=reader)

    inserted = insert_one(as_writer, user=writer.name)
    selected = select_one(as_reader)

    assert selected.file() == inserted.file()
    assert selected.contributor == writer.name


@integration
def test_multiple_writers(database: RepoDatabase):
    first = database.create_contributor()
    second = database.create_contributor()
    as_first = connect_as(database, role=first)
    as_second = connect_as(database, role=second)

    first_inserted = insert_many(as_first, user="some-wrong-name", count=10)
    second_inserted = insert_many(as_second, user="other-wrong-name", count=10)

    first_selected = select_all(as_first)
    second_selected = select_all(as_second)

    assert len(first_selected) == len(first_inserted) + len(second_inserted)
    assert len(first_selected) == len(second_selected)
    assert files(first_selected) == files(first_inserted) | files(second_inserted)
    assert files(second_selected) == files(first_selected)
    assert files(Record.get(first_selected, user=first.name)) == files(first_inserted)
    assert files(Record.get(first_selected, user=second.name)) == files(second_inserted)
    assert files(Record.get(second_selected, user=first.name)) == files(first_inserted)
    assert files(Record.get(second_selected, user=second.name)) == files(second_inserted)


@integration
def test_delete_others(database: RepoDatabase):
    first = database.create_contributor()
    second = database.create_contributor()
    as_first = connect_as(database, role=first)
    as_second = connect_as(database, role=second)

    first_inserted = insert_many(as_first, user="some-wrong-name", count=10)
    second_inserted = insert_many(as_second, user="other-wrong-name", count=10)

    delete_all(as_first)
    after_first_deletion = select_all(as_second)

    assert files(after_first_deletion) == files(second_inserted)
    assert not files(after_first_deletion) & files(first_inserted)

    delete_all(as_second)
    after_second_deletion = select_all(as_first)

    assert not files(after_second_deletion)
