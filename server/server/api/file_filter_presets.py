from http import HTTPStatus
from typing import Dict, Tuple, Optional

from flask import jsonify, request, abort
from sqlalchemy.exc import IntegrityError, DataError

from db.schema import FileFilterPreset
from .blueprint import api
from .constants import ValidationErrors
from .helpers import (
    parse_positive_int,
)
from ..model import database, Transform


@api.route("/files/filter-presets/", methods=["GET"])
def list_file_filter_presets():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    name = request.args.get("name", "", type=str).strip()

    query = database.session.query(FileFilterPreset)

    # Apply optional name filter
    if name:
        query = query.filter(FileFilterPreset.name.ilike(f"%{name}%"))

    total = query.count()
    presets = query.limit(limit).offset(offset).all()
    return jsonify(
        {
            "items": [Transform.file_filter_preset(preset) for preset in presets],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/files/filter-presets/<int:preset_id>", methods=["GET"])
def get_file_filter_presets(preset_id):
    # Fetch preset from database
    preset = database.session.query(FileFilterPreset).get(preset_id)

    # Handle preset not found
    if preset is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Preset id not found: {preset_id}")

    return jsonify(Transform.file_filter_preset(preset))


def validate_preset_name(data: Dict, current: Optional[FileFilterPreset] = None) -> Tuple[str, Dict[str, str]]:
    """Validate preset name."""
    if data["name"] is None:
        return "Name cannot be null", {"name": ValidationErrors.MISSING_REQUIRED.value}

    if not isinstance(data["name"], str):
        return "Name must be a string value", {"name": ValidationErrors.INVALID_VALUE.value}

    data["name"] = data["name"].strip()
    if len(data["name"]) == 0:
        return "Name cannot be empty", {"name": ValidationErrors.MISSING_REQUIRED.value}

    if len(data["name"]) > 100:
        return "Name is too long", {"name": ValidationErrors.OUT_OF_BOUNDS.value}

    name_exists = database.session.query(FileFilterPreset).filter(FileFilterPreset.name == data["name"]).count() > 0
    if name_exists and (current is None or data["name"] != current.name):
        return f"Preset name already exists: {data['name']}", {"name": ValidationErrors.UNIQUE_VIOLATION.value}


def validate_new_preset_dto(data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate new preset DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields, actual_fields = {"name", "filters"}, set(data.keys())
    missing_fields = expected_fields - actual_fields
    if missing_fields:
        return f"Payload must have all of the required fields: {expected_fields}", {
            field: ValidationErrors.MISSING_REQUIRED.value for field in missing_fields
        }

    unknown_fields = actual_fields - expected_fields
    if unknown_fields:
        return f"Payload contains unexpected fields: {unknown_fields}", {}

    name_error = validate_preset_name(data)
    if name_error is not None:
        return name_error

    if data["filters"] is None:
        return "Filters cannot be null", {"filters": ValidationErrors.MISSING_REQUIRED.value}

    if not isinstance(data["filters"], dict):
        return "Filters must be an object", {"filters": ValidationErrors.INVALID_VALUE.value}

    return None, {}


@api.route("/files/filter-presets/", methods=["POST"])
def create_file_filter_preset():
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_new_preset_dto(request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    # Create preset
    preset = FileFilterPreset(**request_payload)
    database.session.add(preset)

    # Try to commit session
    try:
        database.session.commit()
    except (IntegrityError, DataError):
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    return jsonify(Transform.file_filter_preset(preset))


def validate_update_preset_dto(preset: FileFilterPreset, data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate update-preset DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields = {"name", "filters"}
    actual_fields = set(data.keys())
    if not actual_fields <= expected_fields:
        return f"Payload can include only the following fields: {expected_fields}", {}

    if "name" in data:
        name_error = validate_preset_name(data, current=preset)
        if name_error is not None:
            return name_error

    if "filters" in data:
        if data["filters"] is None:
            return "Filters cannot be null", {"filters": ValidationErrors.MISSING_REQUIRED.value}

        if not isinstance(data["filters"], dict):
            return "Filters must be an object", {"filters": ValidationErrors.INVALID_VALUE.value}

    return None, {}


@api.route("/files/filter-presets/<int:preset_id>", methods=["PATCH"])
def update_file_filter_preset(preset_id):
    # Fetch preset from database
    preset = database.session.query(FileFilterPreset).get(preset_id)

    # Handle template not found
    if preset is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Preset id not found: {preset_id}")

    # Get payload
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_update_preset_dto(preset, request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    preset.name = request_payload.get("name", preset.name)
    preset.filters = request_payload.get("filters", preset.filters)

    try:
        database.session.commit()
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    return jsonify(Transform.file_filter_preset(preset))


@api.route("/files/filter-presets/<int:preset_id>", methods=["DELETE"])
def delete_file_filter_presets(preset_id):
    # Fetch preset from database
    preset = database.session.query(FileFilterPreset).get(preset_id)

    # Handle preset not found
    if preset is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Preset id not found: {preset_id}")

    # Delete example
    database.session.delete(preset)
    database.session.commit()
    return "", HTTPStatus.NO_CONTENT.value
