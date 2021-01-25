import numbers
from datetime import datetime, timedelta

import pytimeparse

from cli.platform.error import CliError


def valid_sequence(name, value, admissible_values, required=False):
    """Ensure the value is a sequence of the admissible values."""
    if not required and value is None:
        return None
    if value in admissible_values:
        return (value,)
    if isinstance(value, (list, tuple)):
        for item in value:
            if item not in admissible_values:
                raise CliError(f"--{name} must be a sequence of {_enumerate(admissible_values)}")
        return value
    raise CliError(f"--{name} must be a sequence of {_enumerate(admissible_values)}")


def valid_enum(name, value, enum, required=False):
    """Ensure the value is from the enum."""
    enum_values = set(e.value for e in enum)
    if not required and value is None:
        return None
    if value not in enum_values:
        raise CliError(f"--{name} must be {_enumerate(enum_values)}")
    return enum(value)


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


def valid_string(name, value, pattern, required=False):
    """Ensure valid string format."""
    if not required and value is None:
        return None
    if value is None:
        raise CliError(f"Missing required parameter --{name}")
    value = str(value)
    if pattern.match(value):
        return value
    else:
        raise CliError(f"Invalid argument format: --{name}={value}")


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


def valid_duration_millis(name, value, required=False, granularity="seconds"):
    """Ensure value is a valid duration."""
    if not required and value is None:
        return None
    if isinstance(value, numbers.Number):
        amount = float(value)
        if amount < 0:
            raise CliError(f"--{name} cannot be negative.")
        return timedelta(**{granularity: amount}).total_seconds() * 1000
    try:
        seconds = pytimeparse.parse(value)
    except TypeError:
        raise CliError(
            f"Invalid --{name} format: expected valid duration in {granularity} "
            f"(e.g. '1.2', '1:05:00', '0:35', '25s', '1d', '1d5h30s', etc.)"
        )
    if seconds is None:
        raise CliError(
            f"Invalid --{name} format: expected valid duration in {granularity} "
            f"(e.g. '1.2', '1:05:00', '0:35', '25s', '1d', '1d5h30s', etc.)"
        )
    return float(seconds) * 1000
