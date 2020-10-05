import re
from datetime import datetime
from http import HTTPStatus

from flask import current_app, abort
from sqlalchemy import or_

from db.schema import Matches, Files
from ..config import Config
from ..model import database


def file_matches(file_id):
    """Query for all file matches."""
    return database.session.query(Matches).filter(or_(
        Matches.query_video_file_id == file_id,
        Matches.match_video_file_id == file_id
    ))


def get_config() -> Config:
    """Get current application config."""
    return current_app.config.get("CONFIG")


_TRUTHY = {'1', 'true', ''}
_FALSY = {'0', 'false'}


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
        abort(HTTPStatus.BAD_REQUEST.value, f"{name} has invalid format (expected {_TRUTHY} or {_FALSY})")


def parse_positive_int(args, name, default=None):
    """Parse positive integer parameter."""
    value = args.get(name, default=default, type=int)
    if value is not default and value < 0:
        abort(HTTPStatus.BAD_REQUEST.value, f"{name} cannot be negative")
    return value


DATE_PATTERN = re.compile(r'^\d{4}-\d{2}-\d{2}$')


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
        abort(HTTPStatus.BAD_REQUEST.value, f"{name} must be on of {values}")
    return value


def has_matches(threshold):
    """Create a filter criteria to check if there is a match
    with distance lesser or equal to the given threshold."""
    return or_(Files.source_matches.any(Matches.distance <= threshold),
               Files.target_matches.any(Matches.distance <= threshold))
