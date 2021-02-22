import sys
from typing import Optional

import inquirer

import repo_admin.cli.platform.arguments as arguments
from repo_admin.bare_database.model import Repository
from repo_admin.bare_database.schema import RepoDatabase
from repo_admin.bare_database.storage import RepoStorage
from repo_admin.cli.handlers.user import UserCliHandler
from repo_admin.cli.platform.arguments import Arg
from repo_admin.cli.platform.error import handle_errors, CliError


class RootCliHandler:
    """A command-line tool for video fingerprint repository management."""

    def __init__(self):
        self.user = UserCliHandler()

    @handle_errors
    def list(self):
        """List saved repositories."""
        storage = RepoStorage()
        print("REPOSITORY NAME")
        for name in storage.names():
            print(name)

    @handle_errors
    def add(
        self,
        name: str,
        host: str,
        port: int,
        database: str,
        username: str = "postgres",
        password: Optional[str] = None,
    ):
        """Save repository details."""
        repo = Repository(name=name, host=host, port=port, database=database, username=username, password=password)
        repo = arguments.resolve_repository(repo, require_password=False, password_argument=Arg(password=password))

        storage = RepoStorage()
        storage.save(repo)
        print(f"Repository '{repo.name}' successfully saved to {storage.directory}.")

    @handle_errors
    def delete(self, repo: str):
        """Remove repository details."""

        try:
            storage = RepoStorage()
            storage.delete(name=repo)
        except KeyError:
            raise CliError(f"Repository not found: {repo}")

    @handle_errors
    def init(self, repo: str, password: Optional[str] = None, verbose: bool = False):
        """Initialize repository schema."""
        repository = arguments.read_repository(name=repo, password=Arg(password=password))
        database = RepoDatabase(uri=repository.uri, echo=bool(verbose))
        database.apply_schema()

    @handle_errors
    def drop(self, repo: str, password: Optional[str] = None, verbose: bool = False, force: bool = False):
        """Drop repository schema constructs."""
        repository = arguments.read_repository(name=repo, password=Arg(password=password))
        if not self._should_proceed(repository, force):
            print("Aborting.")
            sys.exit(1)

        database = RepoDatabase(uri=repository.uri, echo=bool(verbose))
        database.drop_schema()

    def _should_proceed(self, repository: Repository, force: bool):
        """Ensure that user wants to proceed with drop operation."""
        return force or (
            inquirer.text(
                "Are you sure you want to drop the database"
                f" schema for the repository '{repository.name}'? All "
                "information will be deleted permanently. "
                f"Enter 'drop {repository.name}' if you want to proceed."
            )
            == f"drop {repository.name}"
        )
