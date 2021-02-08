import pytest

from repo_admin.bare_database.schema import RepoDatabase
from tests.conftest import integration


@pytest.fixture
def database(database_uri):
    """Create repository database."""
    database = RepoDatabase(url=database_uri)
    yield database
    database.drop_schema()


@integration
def test_example(database):
    assert database is not None
