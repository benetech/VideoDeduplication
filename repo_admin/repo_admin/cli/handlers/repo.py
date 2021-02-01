import sys
from typing import Optional

import inquirer

from repo_admin.bare_database.credentials import RepoStorage
from repo_admin.bare_database.schema import RepoDatabase
from repo_admin.cli.platform.arguments import get_database_url
from repo_admin.cli.platform.error import handle_errors, CliError


class RepoCliHandler:
    """Repository credentials management."""

    @handle_errors
    def list(self):
        """List saved repositories."""
        repo_storage = RepoStorage()
        for repo in repo_storage.list_repos():
            print(repo)

    @handle_errors
    def add(
        self,
        repo_name: str,
        host: str,
        port: int,
        dbname: str,
        user: str = "postgres",
        password: Optional[str] = None,
    ):
        """Save repository credentials."""
        database_url = get_database_url(host=host, port=port, dbname=dbname, user=user, password=password)
        repo_storage = RepoStorage()
        repo_storage.save_repo(repo_name=repo_name, connection_url=database_url)
        print(f"Repository '{repo_name}' successfully saved.")

    @handle_errors
    def delete(self, repo_name: str):
        """Remove repository."""
        repo_storage = RepoStorage()
        if not repo_storage.exists(repo_name):
            raise CliError(f"Repository doesnt exist: {repo_name}")
        repo_storage.delete_repo(repo_name)

    @handle_errors
    def init(self, repo_name: str, verbose: bool = False):
        """Initialize repository schema."""
        repo_storage = RepoStorage()
        if not repo_storage.exists(repo_name):
            raise CliError(f"Repository doesnt exist: {repo_name}")
        database_url = repo_storage.read_repo(repo_name)
        database = RepoDatabase(database_url, echo=bool(verbose))
        database.apply_schema()

    @handle_errors
    def drop(self, repo_name: str, force: bool = False, verbose: bool = False):
        """Drop repository schema constructs."""
        repo_storage = RepoStorage()
        if not repo_storage.exists(repo_name):
            raise CliError(f"Repository doesnt exist: {repo_name}")
        proceed = force or (
            inquirer.text(
                "Are you sure you want to drop the database"
                f" schema for the repository {repo_name}? All "
                "information will be deleted permanently. "
                f"Enter 'drop {repo_name}' if you want to proceed."
            )
            == f"drop {repo_name}"
        )
        if not proceed:
            print("Aborting.")
            sys.exit(1)

        database_url = repo_storage.read_repo(repo_name)
        database = RepoDatabase(database_url, echo=bool(verbose))
        database.drop_schema()
