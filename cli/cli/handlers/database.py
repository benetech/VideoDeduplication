from db import Database
from .db_faker import DBFakerCli
from .db_getter import DBGetterCli
from .errors import handle_errors
from .helpers import confirm

# Maximal amount of items to be fetched at a time
ITEMS_CHUNK = 100


class DatabaseCli:
    """Manage database."""

    def __init__(self, config):
        self._config = config
        self.fake = DBFakerCli(self._config)
        self.get = DBGetterCli(self._config)

    @handle_errors
    def create(self, verbose=False):
        """Apply database schema."""
        database = Database.from_uri(self._config.database.uri, echo=verbose)
        database.create_tables()

    @handle_errors
    def drop(self, force=False, verbose=False):
        """Drop all tables."""
        database = Database.from_uri(self._config.database.uri, echo=verbose)
        confirm("All data will be lost. Are you sure you want to drop database?", force=force)
        database.drop_tables()

    @handle_errors
    def recreate(self, force=False, verbose=False):
        """Drop and recreate all database tables."""
        self.drop(force=force, verbose=verbose)
        self.create(verbose=verbose)
