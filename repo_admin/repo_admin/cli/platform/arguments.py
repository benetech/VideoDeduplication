import sys
from typing import Any

import inquirer

from repo_admin.bare_database.model import Repository
from repo_admin.bare_database.storage import RepoStorage
from repo_admin.cli.platform.error import CliError
from repo_admin.cli.platform.messages import warn


class Arg:
    """CLI argument."""

    def __init__(self, **kwargs):
        if len(kwargs) != 1:
            raise TypeError("Arg() takes exactly one keyword argument")
        for name, value in kwargs.items():
            self.name = name
            self.value = value

    name: str
    value: Any


def read_repository(name, password: Arg) -> Repository:
    """Read repository with its credentials."""
    try:
        repo = RepoStorage().read(name)
    except KeyError:
        raise CliError(f"Repository not found: {name}")

    return resolve_repository(repo, require_password=True, password_argument=password)


def resolve_repository(repo: Repository, require_password=True, password_argument: Arg = None) -> Repository:
    """Resolve missing repository attributes."""
    error_message = repo.validate()
    if error_message is not None:
        raise CliError(error_message)

    # Try to use password literal argument if password is unknown
    if not repo.password and password_argument is not None:
        repo.password = password_argument.value

    # If password literal is not provided try to ask for password interactively
    if not repo.password and sys.stdin.isatty():
        repo.password = inquirer.password(f"Please enter admin password for repository '{repo.name}'")

    # If password is required but still undefined, raise an error
    if require_password and not repo.password and password_argument is not None:
        raise CliError(
            f"Cannot resolve password for repository {repo.name}. "
            f"Please specify password as '--{password_argument.name}=<password>' "
            "or using interactive terminal."
        )
    elif require_password and not repo.password:
        raise CliError(
            f"Cannot resolve password for repository {repo.name}. "
            f"Please specify password using interactive terminal."
        )

    return repo


def resolve_user_password(argument: Arg):
    """Resolve contributor role password."""
    password = argument.value
    if password is None and sys.stdin.isatty():
        password = inquirer.password(
            "Please enter password for a contributor role (or press Enter to generate a random one)"
        )
    return password or None


def normalize_username(username):
    """Make sure username is lowercase."""
    if username is None:
        return None
    username = str(username)
    if not username.islower():
        warn(
            f"Note that contributor names are not case-sensitive. "
            f"'{username.lower()}' will be used instead of '{username}'"
        )
        username = username.lower()
    return username
