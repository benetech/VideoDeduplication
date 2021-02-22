import sys
from typing import Optional

import inquirer

import repo_admin.cli.platform.arguments as arguments
from repo_admin.bare_database.model import Role
from repo_admin.bare_database.schema import RepoDatabase
from repo_admin.cli.platform.arguments import Arg
from repo_admin.cli.platform.error import handle_errors
from repo_admin.cli.platform.messages import warn


class UserCliHandler:
    """Manage repository contributors."""

    @handle_errors
    def add(
        self,
        repo: str,
        username: Optional[str] = None,
        password: Optional[str] = None,
        admin_password: Optional[str] = None,
        verbose: bool = False,
    ):
        """Add a new repository contributor."""
        repository = arguments.read_repository(name=repo, password=Arg(admin_password=admin_password))
        database = RepoDatabase(uri=repository.uri, echo=bool(verbose))
        password = arguments.resolve_user_password(Arg(password=password))
        created = database.create_contributor(Role(name=username, password=password))
        print("Successfully created a new contributor:")
        self._print_role(created)

    @handle_errors
    def delete(
        self,
        repo: str,
        username: str,
        admin_password: Optional[str] = None,
        verbose: bool = False,
        force: bool = False,
    ):
        """Delete existing repository contributor."""
        self._ensure_proceed(contributor=username, force=force)
        repository = arguments.read_repository(name=repo, password=Arg(admin_password=admin_password))
        database = RepoDatabase(uri=repository.uri, echo=bool(verbose))
        database.delete_contributor(Role(name=username))

    @handle_errors
    def list(
        self,
        repo: str,
        password: Optional[str] = None,
    ):
        """List registered repository contributors."""
        repository = arguments.read_repository(name=repo, password=Arg(password=password))
        database = RepoDatabase(uri=repository.uri)
        print("CONTRIBUTOR NAME")
        for role in database.list_contributors():
            print(role.name)

    @handle_errors
    def update(
        self,
        repo: str,
        contributor: str,
        new_password: Optional[str] = None,
        admin_password: Optional[str] = None,
        verbose: bool = False,
    ):
        """Update contributor password."""
        repository = arguments.read_repository(name=repo, password=Arg(admin_password=admin_password))
        database = RepoDatabase(uri=repository.uri, echo=bool(verbose))
        new_password = arguments.resolve_user_password(Arg(password=new_password))
        updated = database.update_contributor(Role(name=contributor, password=new_password))
        print("Successfully updated contributor password:")
        self._print_role(updated)

    def _print_role(self, role: Role):
        """Print role credentials."""
        print(f"[username]: {role.name}")
        print(f"[password]: {repr(role.password)}\n")
        warn(
            "This is the only time you will be able to view this password. "
            "However you can modify users to create a new password at any time."
        ),

    def _ensure_proceed(self, contributor: str, force: bool):
        """"""
        proceed = force or inquirer.confirm(
            f"This will delete contributor '{contributor}' permanently. Continue?", default=False
        )
        if not proceed:
            print("Aborting")
            sys.exit(1)
