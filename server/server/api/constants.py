import enum


class ValidationErrors(enum.Enum):
    """Constants for validation errors."""

    UNIQUE_VIOLATION = "UNIQUE_VIOLATION"
    MISSING_REQUIRED = "MISSING_REQUIRED"
    OUT_OF_BOUNDS = "OUT_OF_BOUNDS"
    INVALID_VALUE = "INVALID_VALUE"
