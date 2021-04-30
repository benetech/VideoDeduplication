from http import HTTPStatus
from typing import Dict, Tuple

from flask import jsonify, request, abort
from sqlalchemy.exc import IntegrityError

from db.schema import TemplateFileExclusion, Files, Template
from .blueprint import api
from .constants import ValidationErrors
from .helpers import (
    parse_positive_int,
)
from ..model import database, Transform


@api.route("/template-file-exclusions/", methods=["GET"])
def list_template_file_exclusions():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    template_id = parse_positive_int(request.args, "template_id")
    file_id = parse_positive_int(request.args, "file_id")

    # Fetch template file exclusions
    query = database.session.query(TemplateFileExclusion)
    if file_id is not None:
        query = query.filter(TemplateFileExclusion.file_id == file_id)
    if template_id is not None:
        query = query.filter(TemplateFileExclusion.template_id == template_id)

    total = query.count()
    exclusions = query.limit(limit).offset(offset).all()

    data = {
        "items": [Transform.template_file_exclusion(exclusion) for exclusion in exclusions],
        "total": total,
        "offset": offset,
    }
    return jsonify(data)


@api.route("/template-file-exclusions/<int:exclusion_id>", methods=["GET"])
def get_template_file_exclusion(exclusion_id):
    # Fetch template file exclusion
    query = database.session.query(TemplateFileExclusion)
    query = query.filter(TemplateFileExclusion.id == exclusion_id)
    exclusion = query.one_or_none()

    if exclusion is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template file exclusion not found: id={exclusion_id}")

    return jsonify(Transform.template_file_exclusion(exclusion))


def validate_new_file_exclusion_dto(data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate new template file exclusion DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields = {"template_id", "file_id"}
    missing_fields = expected_fields - set(data.keys())
    if missing_fields:
        return f"Payload must have the following fields: {expected_fields}", {
            field: ValidationErrors.MISSING_REQUIRED.value for field in missing_fields
        }

    # Validate template id
    if not isinstance(data["template_id"], int):
        return "template_id must be an integer", {"template_id": ValidationErrors.INVALID_VALUE.value}

    template = database.session.query(Template).filter(Template.id == data["template_id"]).one_or_none()
    if template is None:
        return f"Template id not found:{data['template_id']}", {"template_id": ValidationErrors.NOT_FOUND.value}

    # Validate file id
    if not isinstance(data["file_id"], int):
        return "file_id must be an integer", {"file_id": ValidationErrors.INVALID_VALUE.value}

    file = database.session.query(Files).filter(Files.id == data["file_id"]).one_or_none()
    if file is None:
        return f"File id not found:{data['file_id']}", {"file_id": ValidationErrors.NOT_FOUND.value}

    # Ensure unique
    already_exists = (
        database.session.query(TemplateFileExclusion)
        .filter(TemplateFileExclusion.file_id == data["file_id"])
        .filter(TemplateFileExclusion.template_id == data["template_id"])
        .count()
        > 0
    )
    if already_exists:
        return f"Template file exclusion already exists: template={data['template_id']}, file={data['file_id']}", {}

    return None, {}


@api.route("/template-file-exclusions/", methods=["POST"])
def create_template_file_exclusion():
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_new_file_exclusion_dto(request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    # Create template file exclusion
    exclusion = TemplateFileExclusion(**request_payload)
    database.session.add(exclusion)

    # Try to commit session
    try:
        database.session.commit()
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    return jsonify(Transform.template_file_exclusion(exclusion))


@api.route("/template-file-exclusions/<int:exclusion_id>", methods=["DELETE"])
def delete_template_file_exclusion(exclusion_id):
    # Fetch template file exclusion
    query = database.session.query(TemplateFileExclusion)
    query = query.filter(TemplateFileExclusion.id == exclusion_id)
    exclusion = query.one_or_none()

    if exclusion is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template file exclusion not found: id={exclusion_id}")

    database.session.delete(exclusion)
    database.session.commit()
    return "", HTTPStatus.NO_CONTENT.value
