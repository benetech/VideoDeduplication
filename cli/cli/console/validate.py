from datetime import datetime

from cli.console.error import CliError


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
