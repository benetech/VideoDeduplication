from http import HTTPStatus
from typing import Dict, Tuple

from flask import jsonify, request, abort
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from db.schema import Files, TemplateMatches
from .blueprint import api
from .constants import ValidationErrors
from .helpers import (
    parse_positive_int,
    parse_fields,
)
from db.access.fields import Fields
from ..model import database, Transform

TEMPLATE_MATCH_FIELDS = Fields(TemplateMatches.template, TemplateMatches.file)


@api.route("/template_matches/", methods=["GET"])
def list_template_matches():
    include_fields = parse_fields(request.args, "include", TEMPLATE_MATCH_FIELDS)
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    template_id = parse_positive_int(request.args, "template_id")
    file_id = parse_positive_int(request.args, "file_id")

    # Fetch template examples
    query = database.session.query(TemplateMatches)
    TEMPLATE_MATCH_FIELDS.preload(query, include_fields)
    if file_id is not None:
        query = query.filter(TemplateMatches.file_id == file_id)
    if template_id is not None:
        query = query.filter(TemplateMatches.template_id == template_id)

    total = query.count()
    matches = query.limit(limit).offset(offset).all()

    data = {
        "items": [Transform.template_match(match, template=False, file=False) for match in matches],
        "total": total,
        "offset": offset,
    }
    if TemplateMatches.template in include_fields:
        templates = {match.template.id: match.template for match in matches}
        data["templates"] = [Transform.template(template, examples=False) for template in templates.values()]
    if TemplateMatches.file in include_fields:
        files = {match.file.id: match.file for match in matches}
        data["files"] = [Transform.file(file, exif=True, meta=True) for file in files.values()]
    return jsonify(data)


@api.route("/template_matches/<int:match_id>", methods=["GET"])
def get_template_match(match_id):
    include_fields = parse_fields(request.args, "include", TEMPLATE_MATCH_FIELDS)

    # Fetch template examples
    query = database.session.query(TemplateMatches)
    query = query.filter(TemplateMatches.id == match_id)
    TEMPLATE_MATCH_FIELDS.preload(query, include_fields)
    match = query.one_or_none()

    if match is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template match not found: id={match_id}")

    include_flags = {field.key: True for field in include_fields}
    return jsonify(Transform.template_match(match, **include_flags))


@api.route("/template_matches/<int:match_id>", methods=["DELETE"])
def delete_template_match(match_id):
    # Fetch template examples
    query = database.session.query(TemplateMatches)
    query = query.filter(TemplateMatches.id == match_id)
    match = query.one_or_none()

    if match is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template match not found: id={match_id}")

    database.session.delete(match)
    database.session.commit()
    return "", HTTPStatus.NO_CONTENT.value


@api.route("/files/<int:file_id>/template_matches/", methods=["GET"])
def list_file_template_matches(file_id):
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    template_id = parse_positive_int(request.args, "template_id")

    # Fetch file from database
    file = database.session.query(Files).get(file_id)

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File not found: id={file_id}")

    # Fetch template examples
    query = database.session.query(TemplateMatches)
    query = query.filter(TemplateMatches.file_id == file_id)
    query = query.options(joinedload(TemplateMatches.template))
    if template_id is not None:
        query = query.filter(TemplateMatches.template_id == template_id)

    total = query.count()
    matches = query.limit(limit).offset(offset).all()
    templates = {match.template.id: match.template for match in matches}
    return jsonify(
        {
            "items": [Transform.template_match(match, template=False, file=False) for match in matches],
            "templates": [Transform.template(template, examples=False) for template in templates.values()],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/files/<int:file_id>/template_matches/<int:match_id>", methods=["GET"])
def get_file_template_match(file_id, match_id):
    include_fields = parse_fields(request.args, "include", TEMPLATE_MATCH_FIELDS)

    # Fetch template examples
    query = database.session.query(TemplateMatches)
    query = query.filter(TemplateMatches.id == match_id)
    query = query.filter(TemplateMatches.file_id == file_id)
    TEMPLATE_MATCH_FIELDS.preload(query, include_fields)
    match = query.one_or_none()

    if match is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template match not found: id={match_id} file_id={file_id}")

    include_flags = {field.key: True for field in include_fields}
    return jsonify(Transform.template_match(match, **include_flags))


def validate_update_template_match_dto(data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate update-template-match DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields = {"false_positive"}
    actual_fields = set(data.keys())
    if not actual_fields <= expected_fields:
        return f"Payload can include only the following fields: {expected_fields}", {}

    if not isinstance(data["false_positive"], bool):
        return "false_positive must be a boolean value", {"false_positive": ValidationErrors.INVALID_VALUE.value}

    return None, {}


@api.route("/template_matches/<int:match_id>", methods=["PATCH"])
def update_template_match(match_id):
    include_fields = parse_fields(request.args, "include", TEMPLATE_MATCH_FIELDS)

    # Fetch template examples
    query = database.session.query(TemplateMatches)
    query = query.filter(TemplateMatches.id == match_id)
    TEMPLATE_MATCH_FIELDS.preload(query, include_fields)
    match = query.one_or_none()

    if match is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template match not found: id={match_id}")

    # Get payload
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    error, fields = validate_update_template_match_dto(request_payload)
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
    return jsonify(Transform.template_match(match, **include_flags))


@api.route("/files/<int:file_id>/template_matches/<int:match_id>", methods=["DELETE"])
def delete_file_template_match(file_id, match_id):
    # Fetch template examples
    query = database.session.query(TemplateMatches)
    query = query.filter(TemplateMatches.id == match_id)
    query = query.filter(TemplateMatches.file_id == file_id)
    match = query.one_or_none()

    if match is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template match not found: id={match_id} file_id={file_id}")

    database.session.delete(match)
    database.session.commit()
    return "", HTTPStatus.NO_CONTENT.value
