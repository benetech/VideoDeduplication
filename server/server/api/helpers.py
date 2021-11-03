import enum
import os
import re
from datetime import datetime
from http import HTTPStatus
from typing import Type

from flask import current_app, abort

from db.access.fields import Fields
from template_support.file_storage import FileStorage
from thumbnail.cache import ThumbnailCache
from ..config import Config
from ..queue import TaskQueue
from ..queue.framework import TaskLogStorage
from ..socket.log_watcher import LogWatcher


def get_config() -> Config:
    """Get current application config."""
    return current_app.config.get("CONFIG")


def get_task_queue() -> TaskQueue:
    """Get current TaskQueue instance associated with the current application."""
    return current_app.config.get("TASK_QUEUE")


def get_log_storage() -> TaskLogStorage:
    """Get current TaskLogStorage instance associated with the current application."""
    return current_app.config.get("LOG_STORAGE")


def get_file_storage() -> FileStorage:
    """Get application file storage."""
    return current_app.config.get("APP_FILE_STORAGE")


def get_log_watcher() -> LogWatcher:
    """Get current LogWatcher instance."""
    return current_app.config.get("LOG_WATCHER")


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


def parse_int_list(args, name, default=None):
    """Parse integer list."""
    value = args.get(name, default=None, type=str)
    if value is None:
        return default
    result = []
    for item in map(str.strip, value.split(",")):
        try:
            result.append(int(item))
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST.value, f"'{name}' must be a comma-separated list of ints")
    return result


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


def parse_enum(args, name, enum_class: Type[enum.Enum], default=None):
    """Parse enum parameter."""
    values = set(e.value for e in enum_class)
    value = args.get(name, default=default)
    if value is default:
        return enum_class(value) if value is not None else value
    if value not in values:
        abort(HTTPStatus.BAD_REQUEST.value, f"'{name}' must be one of {values}")
    return enum_class(value)


def parse_seq_predefined(args, name, values, default=None):
    """Parse sequence of predefined string values."""
    raw_value = args.get(name)
    if raw_value is None:
        return default
    result = set()
    for value in parse_seq(args, name):
        if value not in values:
            abort(HTTPStatus.BAD_REQUEST.value, f"'{name}' must be a comma-separated sequence of values from {values}")
        result.add(value)
    return result


def parse_enum_seq(args, name, enum_class: Type[enum.Enum], default=None):
    """Parse sequence of enum values."""
    raw_seq = args.get(name)
    enum_values = {option.value for option in enum_class}
    if raw_seq is None:
        return default
    result = set()
    for value in raw_seq.split(","):
        if value not in enum_values:
            abort(
                HTTPStatus.BAD_REQUEST.value,
                f"'{name}' must be a comma-separated sequence of values from {enum_values}",
            )
        result.add(enum_class(value))
    return result


def parse_fields(args, name, fields: Fields):
    """Parse requested fields list."""
    field_names = parse_seq_predefined(args, name, values=fields.names, default=())
    return {fields.get(name) for name in field_names}
