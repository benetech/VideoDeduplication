from http import HTTPStatus
from typing import Dict, Tuple

from flask import jsonify, request, abort
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from db.access.files import FilesDAO
from db.access.matches import MatchSort, MatchSortDirection, MatchesDAO
from db.schema import Matches, Files
from .blueprint import api
from .constants import ValidationErrors
from .helpers import parse_positive_int, parse_fields, parse_boolean, parse_enum
from db.access.fields import Fields
from ..model import Transform, database

# Optional file fields
FILE_FIELDS = Fields(Files.exif, Files.signature, Files.meta, Files.scenes)


@api.route("/files/<int:file_id>/matches", methods=["GET"])
def list_file_matches(file_id):
    limit = parse_positive_int(request.args, "limit", 20)
    offset = parse_positive_int(request.args, "offset", 0)
    include_fields = parse_fields(request.args, "include", FILE_FIELDS)
    remote = parse_boolean(request.args, "remote")
    false_positive = parse_boolean(request.args, "false_positive")
    match_sort = parse_enum(request.args, "sort", enum_class=MatchSort, default=MatchSort.DISTANCE)
    sort_direction = parse_enum(
        request.args, "sort_direction", enum_class=MatchSortDirection, default=MatchSortDirection.ASC
    )

    file = database.session.query(Files).get(file_id)

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    query = FilesDAO.file_matches(file_id, database.session, false_positive=false_positive).options(
        joinedload(Matches.match_video_file), joinedload(Matches.query_video_file)
    )

    if not remote:
        query = query.filter(Matches.match_video_file.has(Files.contributor == None))  # noqa: E711
        query = query.filter(Matches.query_video_file.has(Files.contributor == None))  # noqa: E711

    # Sort matches
    query = MatchesDAO.sort_matches(query, sort=match_sort, direction=sort_direction)

    # Get requested slice
    total = query.count()
    items = query.offset(offset).limit(limit).all()

    include_flags = {field.key: True for field in include_fields}
    mother_file = Transform.file(file, **include_flags)
    mother_file["matches_count"] = FilesDAO.file_matches(file_id, database.session).count()
    return jsonify(
        {
            "items": [Transform.file_match(item, file_id, **include_flags) for item in items],
            "mother_file": mother_file,
            "total": total,
            "offset": offset,
        }
    )


def validate_update_match_dto(data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate update-match DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields = {"false_positive"}
    actual_fields = set(data.keys())
    if not actual_fields <= expected_fields:
        return f"Payload can include only the following fields: {expected_fields}", {}

    if "false_positive" in data:
        false_positive = data["false_positive"]

        if false_positive is None:
            return "false_positive cannot be null", {"false_positive": ValidationErrors.INVALID_VALUE.value}

        if not isinstance(false_positive, bool):
            return "false_positive cannot be boolean", {"false_positive": ValidationErrors.INVALID_VALUE.value}

    return None, {}


@api.route("/matches/<int:match_id>", methods=["PATCH"])
def update_match(match_id):

    # Fetch match from database
    match = database.session.query(Matches).filter(Matches.id == match_id).one_or_none()

    # Handle match not found
    if match is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Match id not found: {match_id}")

    # Get payload
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_update_match_dto(request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    match.false_positive = request_payload.get("false_positive", match.false_positive)

    try:
        database.session.commit()
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    return jsonify(Transform.match(match))


@api.route("/files/<int:file_id>/matches/<int:match_id>", methods=["PATCH"])
def update_file_match(file_id, match_id):
    include_fields = parse_fields(request.args, "include", FILE_FIELDS)

    file = database.session.query(Files).filter(Files.id == file_id).one_or_none()

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    # Fetch match from database
    match = database.session.query(Matches).filter(Matches.id == match_id).one_or_none()

    # Handle match not found
    if match is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Match id not found: {match_id}")

    # Get payload
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_update_match_dto(request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    match.false_positive = request_payload.get("false_positive", match.false_positive)

    try:
        database.session.commit()
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    include_flags = {field.key: True for field in include_fields}
    return jsonify(Transform.file_match(match, file_id, **include_flags))
