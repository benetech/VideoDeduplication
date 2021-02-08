import sys
from typing import Optional

import inquirer
from termcolor import colored

from repo_admin.bare_database.model import Role
from repo_admin.bare_database.schema import RepoDatabase
from repo_admin.cli.platform.arguments import resolve_database_url
from repo_admin.cli.platform.error import handle_errors


class UserCliHandler:
    """Manage repository contributors."""

    @handle_errors
    def add(
        self,
        repo: str = None,
        host: str = None,
        port: int = None,
        dbname: str = None,
        user: str = None,
        password: Optional[str] = None,
        contributor_name: Optional[str] = None,
        contributor_password: Optional[str] = None,
        verbose: bool = False,
    ):
        """Add a new repository contributor."""
        database_url = resolve_database_url(
            repo=repo,
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
        )
        repo = RepoDatabase(url=database_url, echo=bool(verbose))
        created = repo.create_contributor(Role(name=contributor_name, password=contributor_password))
        print("Successfully created a new contributor:")
        self._print_role(created)

    @handle_errors
    def delete(
        self,
        contributor_name: str,
        repo: str = None,
        host: str = None,
        port: int = None,
        dbname: str = None,
        user: str = None,
        password: Optional[str] = None,
        verbose: bool = False,
        force: bool = False,
    ):
        """Delete existing repository contributor."""
        proceed = force or inquirer.confirm(
            f"This will delete contributor '{contributor_name}' permanently. Continue?", default=False
        )
        if not proceed:
            print("Aborting")
            sys.exit(1)
        database_url = resolve_database_url(
            repo=repo,
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
        )
        repo = RepoDatabase(url=database_url, echo=bool(verbose))
        repo.delete_contributor(Role(name=contributor_name))

    @handle_errors
    def list(
        self,
        repo: str = None,
        host: str = None,
        port: int = None,
        dbname: str = None,
        user: str = None,
        password: Optional[str] = None,
    ):
        """List registered repository contributors."""
        database_url = resolve_database_url(
            repo=repo,
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
        )
        repo = RepoDatabase(url=database_url)
        for role in repo.list_contributors():
            print(role.name)

    @handle_errors
    def update(
        self,
        contributor_name: str,
        contributor_password: Optional[str] = None,
        repo: str = None,
        host: str = None,
        port: int = None,
        dbname: str = None,
        user: str = None,
        password: Optional[str] = None,
        verbose: bool = False,
    ):
        """Update contributor password."""
        database_url = resolve_database_url(
            repo=repo,
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
        )
        repo = RepoDatabase(url=database_url, echo=bool(verbose))
        updated = repo.update_contributor(Role(name=contributor_name, password=contributor_password))
        print("Successfully updated contributor password:")
        self._print_role(updated)

    def _print_role(self, role: Role):
        """Print role credentials."""
        print(f"[username]: {role.name}")
        print(f"[password]: {repr(role.password)}\n")
        print(
            colored("WARNING:", "yellow", attrs=("bold",)),
            colored(
                "This is the only time you will be able to view this password. "
                "However you can modify users to create a new password at any time.",
                "yellow",
            ),
        )
