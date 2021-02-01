import sys
from typing import Optional

import inquirer

from repo_admin.bare_database.credentials import RepoStorage
from repo_admin.cli.platform.error import CliError


def ask_password(message, pass_arg=None, pass_arg_value=None):
    """Get required password."""
    if pass_arg is None and pass_arg_value is not None:
        raise RuntimeError("Invalid usage: pass_arg is None while pass_arg_value is not None")
    if pass_arg_value is not None:
        return pass_arg_value
    if sys.stdin.isatty():
        return inquirer.password(message)
    if pass_arg is not None:
        raise CliError(f"Missing argument: --{pass_arg}")
    raise CliError("Cannot determine password: interactive terminal is required.")


def resolve_database_url(
    repo: str = None,
    host: str = None,
    port: int = None,
    dbname: str = None,
    user: str = None,
    password: Optional[str] = None,
):
    """Resolve database URL."""
    if repo is not None:
        if host is not None:
            raise CliError("Ambiguous repository: repository name and database host cannot be provided simultaneously")
        if port is not None:
            raise CliError("Ambiguous repository: repository name and database port cannot be provided simultaneously")
        if dbname is not None:
            raise CliError("Ambiguous repository: repository name and database name cannot be provided simultaneously")
        if user is not None:
            raise CliError("Ambiguous repository: repository name and database user cannot be provided simultaneously")
        if password is not None:
            raise CliError(
                "Ambiguous repository: repository name and database password cannot be provided simultaneously"
            )
        repo_storage = RepoStorage()
        if not repo_storage.exists(repo):
            raise CliError(f"Unknown repository name: {repo}")
        return repo_storage.read_repo(repo)
    return get_database_url(host=host, port=port, dbname=dbname, user=user, password=password)


def get_database_url(
    host: str,
    port: int,
    dbname: str,
    user: str = "postgres",
    password: Optional[str] = None,
):
    """Construct a database connection string."""
    password = ask_password(f"Please enter database password for user '{user}'", "password", password)
    return f"postgres://{user}:{password}@{host}:{port}/{dbname}"
