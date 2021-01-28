import logging
from functools import wraps

from fire.core import FireError
from sqlalchemy.exc import (
    ArgumentError as DBArgumentError,
    OperationalError as DBOperationalError,
    IntegrityError,
    ProgrammingError,
)
from termcolor import colored


class CliError(FireError):
    """Exception used by the CLI when command cannot be executed."""


logger = logging.getLogger(__name__)


def handle_errors(func):
    """Handle well-known errors."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        """Wrapper that handles well-known errors."""
        try:
            return func(*args, **kwargs)
        except (DBOperationalError, DBArgumentError) as error:
            if hasattr(error, "orig") and error.orig is not None:
                error = error.orig
            logger.error(f"{colored('ERROR', 'red', attrs=('bold',))} Database error: {error}")
            raise SystemExit(1)
        except (IntegrityError, ProgrammingError) as error:
            if hasattr(error, "orig") and error.orig is not None:
                error = error.orig
            logger.error(f"{colored('ERROR', 'red', attrs=('bold',))} Invalid request: {error}")
            raise SystemExit(1)

    return wrapper
