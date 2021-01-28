import sys
from typing import Optional

import inquirer

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
    raise CliError(f"Cannot determine password: interactive terminal is required.")


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
