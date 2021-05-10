from http import HTTPStatus
from numbers import Number
from typing import Dict, Tuple

from flask import jsonify, request, abort
from sqlalchemy.exc import IntegrityError

from db.schema import Files, Template, TemplateTimeRangeExclusion
from .blueprint import api
from .constants import ValidationErrors
from .helpers import (
    parse_positive_int,
    parse_positive_float,
)
from ..model import database, Transform


@api.route("/template-time-exclusions/", methods=["GET"])
def list_template_time_exclusions():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    template_id = parse_positive_int(request.args, "template_id")
    file_id = parse_positive_int(request.args, "file_id")
    min_start = parse_positive_float(request.args, "min_start")
    max_start = parse_positive_float(request.args, "max_start")
    min_end = parse_positive_float(request.args, "min_end")
    max_end = parse_positive_float(request.args, "max_end")

    # Fetch template time exclusions
    query = database.session.query(TemplateTimeRangeExclusion)
    if file_id is not None:
        query = query.filter(TemplateTimeRangeExclusion.file_id == file_id)
    if template_id is not None:
        query = query.filter(TemplateTimeRangeExclusion.template_id == template_id)
    if min_start is not None:
        query = query.filter(TemplateTimeRangeExclusion.start_ms >= min_start)
    if max_start is not None:
        query = query.filter(TemplateTimeRangeExclusion.start_ms <= max_start)
    if min_end is not None:
        query = query.filter(TemplateTimeRangeExclusion.end_ms >= min_end)
    if max_end is not None:
        query = query.filter(TemplateTimeRangeExclusion.end_ms <= max_end)

    total = query.count()
    exclusions = query.limit(limit).offset(offset).all()

    data = {
        "items": [Transform.template_time_exclusion(exclusion) for exclusion in exclusions],
        "total": total,
        "offset": offset,
    }
    return jsonify(data)


@api.route("/template-time-exclusions/<int:exclusion_id>", methods=["GET"])
def get_template_time_exclusion(exclusion_id):
    # Fetch template time exclusion
    query = database.session.query(TemplateTimeRangeExclusion)
    query = query.filter(TemplateTimeRangeExclusion.id == exclusion_id)
    exclusion = query.one_or_none()

    if exclusion is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template time exclusion not found: id={exclusion_id}")

    return jsonify(Transform.template_time_exclusion(exclusion))


def validate_new_time_exclusion_dto(data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate new template time exclusion DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields = {"template_id", "file_id", "start_ms", "end_ms"}
    missing_fields = expected_fields - set(data.keys())
    if missing_fields:
        return f"Payload must have the following fields: {expected_fields}", {
            field: ValidationErrors.MISSING_REQUIRED.value for field in missing_fields
        }

    error, fields = validate_relationships(data["template_id"], data["file_id"])
    if error is not None:
        return error, fields

    return validate_bounds(data["start_ms"], data["end_ms"])


def validate_relationships(template_id, file_id):
    """Validate exclusion relationships."""
    # Validate template id
    if not isinstance(template_id, int):
        return "template_id must be an integer", {"template_id": ValidationErrors.INVALID_VALUE.value}

    template = database.session.query(Template).filter(Template.id == template_id).one_or_none()
    if template is None:
        return f"Template id not found:{template_id}", {"template_id": ValidationErrors.NOT_FOUND.value}

    # Validate file id
    if not isinstance(file_id, int):
        return "file_id must be an integer", {"file_id": ValidationErrors.INVALID_VALUE.value}

    file = database.session.query(Files).filter(Files.id == file_id).one_or_none()
    if file is None:
        return f"File id not found:{file_id}", {"file_id": ValidationErrors.NOT_FOUND.value}

    return None, {}


def validate_bounds(start_ms, end_ms):
    """Validate exclusion bounds."""

    # Validate start_ms
    if not isinstance(start_ms, Number):
        return "start_ms must be a number", {"start_ms": ValidationErrors.INVALID_VALUE.value}

    if start_ms < 0:
        return "start_ms cannot be negative", {"start_ms": ValidationErrors.INVALID_VALUE.value}

    # Validate end_ms
    if not isinstance(end_ms, Number):
        return "end_ms must be a number", {"end_ms": ValidationErrors.INVALID_VALUE.value}

    if end_ms < 0:
        return "end_ms cannot be negative", {"end_ms": ValidationErrors.INVALID_VALUE.value}

    # Check start_ms < end_ms
    if start_ms > end_ms:
        return "start_ms cannot be greater than end_ms", {
            "start_ms": ValidationErrors.INVALID_VALUE.value,
            "end_ms": ValidationErrors.INVALID_VALUE.value,
        }

    return None, {}


@api.route("/template-time-exclusions/", methods=["POST"])
def create_template_time_exclusion():
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_new_time_exclusion_dto(request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    # Create template time exclusion
    exclusion = TemplateTimeRangeExclusion(**request_payload)
    database.session.add(exclusion)

    # Try to commit session
    try:
        database.session.commit()
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    return jsonify(Transform.template_time_exclusion(exclusion))


@api.route("/template-time-exclusions/<int:exclusion_id>", methods=["DELETE"])
def delete_template_time_exclusion(exclusion_id):
    # Fetch template time exclusion
    query = database.session.query(TemplateTimeRangeExclusion)
    query = query.filter(TemplateTimeRangeExclusion.id == exclusion_id)
    exclusion = query.one_or_none()

    if exclusion is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template time exclusion not found: id={exclusion_id}")

    database.session.delete(exclusion)
    database.session.commit()
    return "", HTTPStatus.NO_CONTENT.value
