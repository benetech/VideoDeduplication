import sys
from typing import Optional

import inquirer

from repo_admin.bare_database.schema import RepoDatabase
from repo_admin.cli.platform.arguments import get_database_url
from repo_admin.cli.platform.error import handle_errors


class SchemaCliHandler:
    """Manage repository database schema."""

    @handle_errors
    def apply(
        self,
        host: str,
        port: int,
        dbname: str,
        user: str = "postgres",
        password: Optional[str] = None,
        verbose: bool = False,
    ):
        """Apply repository schema."""
        database_url = get_database_url(host=host, port=port, dbname=dbname, user=user, password=password)
        database = RepoDatabase(url=database_url, echo=bool(verbose))
        database.apply_schema()

    @handle_errors
    def drop(
        self,
        host: str,
        port: int,
        dbname: str,
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
        database_url = get_database_url(host=host, port=port, dbname=dbname, user=user, password=password)
        database = RepoDatabase(url=database_url, echo=bool(verbose))
        database.drop_schema()
