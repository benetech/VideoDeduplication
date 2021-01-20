from datetime import datetime

from cli.console.error import CliError


def valid_enum(name, value, enum_values, required=False):
    """Ensure the value is from the enum."""
    if not required and value is None:
        return None
    if value not in enum_values:
        raise CliError(f"--{name} must be {_enumerate(enum_values)}")
    return value


def positive_int(name, value, required=False):
    """Ensure value is a positive integer."""
    if not required and value is None:
        return None
    if not isinstance(value, int) or value < 0:
        raise CliError(f"--{name} must be a positive integer")
    return value


def boolean(name, value, required=False):
    """Ensure value is a boolean."""
    if not required and value is None:
        return None
    if value is not False and value is not True:
        raise CliError(f"--{name} must be a boolean.")
    return value


DATE_FORMAT = "%Y-%m-%d"


def valid_date(name, value, required=False):
    """Ensure valid date."""
    if not required and value is None:
        return None
    try:
        return datetime.strptime(value, DATE_FORMAT)
    except ValueError:
        raise CliError(f"Cannot recognize --{name} value. Expected format is {DATE_FORMAT}")


def _enumerate(values):
    """Enumerate possible values."""
    values = list(values)
    if len(values) == 0:
        raise ValueError("Values cannot be empty")
    if len(values) == 1:
        return values[0]
    result = ", ".join(map(repr, values[:-1]))
    if len(values) > 1:
        result = f"{result} or {repr(values[-1])}"
    return result
