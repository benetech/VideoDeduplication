import os
import re
from datetime import datetime
from functools import cached_property
from http import HTTPStatus

from flask import current_app, abort
from sqlalchemy.orm import joinedload

from thumbnail.cache import ThumbnailCache
from ..config import Config


def get_config() -> Config:
    """Get current application config."""
    return current_app.config.get("CONFIG")


def get_thumbnails() -> ThumbnailCache:
    """Get current application thumbnail cache."""
    return current_app.config.get("THUMBNAILS")


def resolve_video_file_path(file_path):
    """Get path to the video file."""
    config = get_config()
    return os.path.join(os.path.abspath(config.video_folder), file_path)


_TRUTHY = {"1", "true", ""}
_FALSY = {"0", "false"}


def parse_boolean(args, name):
    """Parse boolean parameter."""
    value = args.get(name)
    if value is None:
        return value
    elif value.lower() in _TRUTHY:
        return True
    elif value.lower() in _FALSY:
        return False
    else:
        abort(HTTPStatus.BAD_REQUEST.value, f"'{name}' has invalid format (expected {_TRUTHY} or {_FALSY})")


def parse_seq(args, name):
    """Parse sequence of comma-separated values."""
    seq = args.get(name, "", type=str)
    items = [item.strip() for item in seq.split(",")]
    items = [item for item in items if len(item) > 0]
    return items


def parse_positive_int(args, name, default=None):
    """Parse positive integer parameter."""
    value = args.get(name, default=default, type=int)
    if value is not default and value < 0:
        abort(HTTPStatus.BAD_REQUEST.value, f"'{name}' cannot be negative")
    return value


def parse_positive_float(args, name, default=None):
    """Parse positive float parameter."""
    value = args.get(name, default=default, type=float)
    if value is not default and value < 0:
        abort(HTTPStatus.BAD_REQUEST.value, f"'{name}' cannot be negative")
    return value


DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def parse_date(args, name, default=None):
    """Parse date parameter."""
    value = args.get(name, default=None)
    if value is default:
        return value
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError as error:
        abort(HTTPStatus.BAD_REQUEST.value, str(error))


def parse_enum(args, name, values, default=None):
    """Parse enum parameter."""
    value = args.get(name, default=default)
    if value is default:
        return value
    if value not in values:
        abort(HTTPStatus.BAD_REQUEST.value, f"'{name}' must be one of {values}")
    return value


def parse_enum_seq(args, name, values, default=None):
    """Parse sequence of enum values."""
    raw_value = args.get(name)
    if raw_value is None:
        return default
    result = set()
    for value in raw_value.split(","):
        if value not in values:
            abort(HTTPStatus.BAD_REQUEST.value, f"'{name}' must be a comma-separated sequence of values from {values}")
        result.add(value)
    return result


def parse_fields(args, name, fields):
    """Parse requested fields list."""
    field_names = parse_enum_seq(args, name, values=fields.names, default=())
    return {fields.get(name) for name in field_names}


class Fields:
    """Helper class to fetch entity fields."""

    def __init__(self, *fields):
        self._fields = tuple(fields)
        self._index = {field.key: field for field in fields}

    @property
    def fields(self):
        """List fields."""
        return self._fields

    @cached_property
    def names(self):
        """Set of field names."""
        return {field.key for field in self.fields}

    def get(self, name):
        """Get field by name."""
        return self._index[name]

    @staticmethod
    def preload(query, fields, *path):
        """Enable eager loading for enumerated fields."""
        for field in fields:
            full_path = path + (field,)
            query = query.options(joinedload(*full_path))
        return query
