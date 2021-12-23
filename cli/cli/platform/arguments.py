import os
import sys
from typing import Tuple

import inquirer

from cli.platform.error import CliError
from winnow.pipeline.pipeline_context import PipelineContext
from remote.connect import RepoConnector


def ask_password(
    message, literal_pass: Tuple[str, str] = (None, None), file_pass: Tuple[str, str] = (None, None), required=False
):
    """Parse password from the command line.

    Args:
        message (str): Message to print on console.
        literal_pass (Tuple[str,str]): A pair containing CLI variable name and value for password literal.
        file_pass (Tuple[str,str]): A pair containing CLI variable name and value for password file.
        required (bool): True iff password is required CLI argument.
    """
    literal_pass_arg, literal_pass_value = literal_pass
    file_pass_arg, file_pass_value = file_pass
    if literal_pass_value is not None and file_pass_value is not None:
        raise CliError(f"Ambiguous password: --{literal_pass_arg} and --{file_pass_arg} are specified simultaneously")
    if literal_pass_value is not None:
        return literal_pass_value
    if file_pass_value is not None:
        return read_argument_file(file_pass_value)
    if sys.stdin.isatty():
        return inquirer.password(message)

    # If password is required but cannot be determined, then raise CliError
    if required:
        if file_pass_arg is not None and literal_pass_arg is not None:
            raise CliError(
                f"Password must be specified either via --{file_pass_arg} or --{literal_pass_arg} arguments."
            )
        elif file_pass_arg is not None:
            raise CliError(f"Password must be specified by --{file_pass_arg} argument.")
        elif literal_pass_arg is not None:
            raise CliError(f"Password must be specified by --{literal_pass_arg} argument.")
        else:
            raise CliError("Cannot read password from non-interactive terminal.")
    return None


def read_argument_file(file_path):
    """Read text file supplied as command-line argument."""
    if file_path == "stdin" or file_path == "-":
        return sys.stdin.readline().strip()
    if not os.path.isfile(str(file_path)):
        raise CliError(f"File not found: {file_path}")
    with open(str(file_path)) as file:
        return file.read().strip()


def get_repo_connector(name: str, pipeline: PipelineContext) -> RepoConnector:
    """Create and configure local database connector."""
    repository = pipeline.repository_dao.get(name=name)
    if repository is None:
        raise CliError(f"Unknown repository: {name}")
    return pipeline.make_connector(repository)
