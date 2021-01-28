import sys
from typing import Optional

import inquirer

from repo_admin.bare_database.schema import RepoDatabase
from repo_admin.cli.platform.error import handle_errors


class SchemaCliHandler:
    """Manage repository database schema."""

    @handle_errors
    def apply(
        self,
        host: str,
        port: int,
        dbname: Optional[str] = None,
        user: str = "postgres",
        password: Optional[str] = None,
        verbose: bool = False,
    ):
        """Apply repository schema."""
        database_url = self._database_url(host=host, port=port, dbname=dbname, user=user, password=password)
        database = RepoDatabase(url=database_url, echo=bool(verbose))
        database.apply_schema()

    @handle_errors
    def drop(
        self,
        host: str,
        port: int,
        dbname: Optional[str] = None,
        user: str = "postgres",
        password: Optional[str] = None,
        force: bool = False,
        verbose: bool = False,
    ):
        """Drop repository schema constructs."""
        proceed = force or inquirer.confirm(
            "This will delete all fingerprints from the repository. Continue?", default=False
        )
        if not proceed:
            print("Aborting")
            sys.exit(1)
        database_url = self._database_url(host=host, port=port, dbname=dbname, user=user, password=password)
        database = RepoDatabase(url=database_url, echo=bool(verbose))
        database.drop_schema()

    def _database_url(
        self, host: str, port: int, dbname: Optional[str] = None, user: str = "postgres", password: Optional[str] = None
    ):
        """Construct a database connection string."""
        if password is None:
            password = inquirer.password(f"Please enter database password for '{user}'")
        database_url = f"postgres://{user}:{password}@{host}:{port}"
        if dbname is not None:
            database_url = f"{database_url}/{dbname}"
        return database_url
