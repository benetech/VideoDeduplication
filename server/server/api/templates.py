import os
import tempfile
from http import HTTPStatus
from pathlib import Path
from typing import Dict, Tuple, List

from flask import jsonify, request, abort
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import defer, joinedload, Session
from werkzeug.utils import secure_filename

from db.access.templates import TemplatesDAO
from db.schema import Template, TemplateExample, IconType
from .blueprint import api
from .constants import ValidationErrors
from .helpers import (
    parse_positive_int,
    get_file_storage,
    parse_enum_seq,
)
from ..model import database, Transform


class TemplateFields:
    """Template field inclusion manager."""

    _FIELD_NAMES = ("examples", "file_count")

    examples: bool = False
    file_count: bool = False

    def __init__(self, args, name="include", default=()):
        include_fields = parse_enum_seq(args, name, values=self._FIELD_NAMES, default=default)
        self.examples = "examples" in include_fields
        self.file_count = "file_count" in include_fields
        self._file_counts: Dict[int, int] = {}
        self._default_count = None

    def load_file_counts(self, session: Session, templates: List[Template]):
        """Preload file counts for the given templates."""
        if self.file_count:
            self._file_counts = TemplatesDAO.query_file_counts(session, templates)
            self._default_count = 0

    def __call__(self, template: Template):
        """Get include fields for the given template."""
        return {
            "examples": self.examples,
            "file_count": self._file_counts.get(template.id, self._default_count),
        }


def template_file_counter(session, templates, fetch_count=False):
    """Create template file counter."""
    file_counts = {}
    default_count = None
    if fetch_count:
        file_counts = TemplatesDAO.query_file_counts(session=session, templates=templates)
        default_count = 0

    def counter(template: Template) -> int:
        """Get matched files count for the template."""
        return file_counts.get(template.id, default_count)

    return counter


@api.route("/templates/", methods=["GET"])
def list_templates():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    include_fields = TemplateFields(request.args)

    query = database.session.query(Template).order_by(Template.name.asc())
    if include_fields.examples:
        query = query.options(joinedload(Template.examples).options(defer(TemplateExample.features)))

    total = query.count()
    templates = query.limit(limit).offset(offset).all()

    include_fields.load_file_counts(database.session, templates)
    return jsonify(
        {
            "items": [Transform.template(template, **include_fields(template)) for template in templates],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/templates/<int:template_id>", methods=["GET"])
def get_template(template_id):
    include_fields = TemplateFields(request.args)

    # Fetch template from database
    query = database.session.query(Template)
    if include_fields.examples:
        query = query.options(joinedload(Template.examples).options(defer(TemplateExample.features)))
    template = query.get(template_id)

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    include_fields.load_file_counts(database.session, [template])
    return jsonify(Transform.template(template, **include_fields(template)))


@api.route("/templates/<int:template_id>", methods=["PATCH"])
def update_template(template_id):
    include_fields = TemplateFields(request.args)

    # Fetch template from database
    query = database.session.query(Template).filter(Template.id == template_id)
    if include_fields.examples:
        query = query.options(joinedload(Template.examples).options(defer(TemplateExample.features)))
    template = query.one_or_none()

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    expected_fields = {"name", "icon_type", "icon_key"}
    if not set(request_payload.keys()) < expected_fields:
        abort(HTTPStatus.BAD_REQUEST.value, f"Payload can include only the following fields: {expected_fields}")

    if "icon_type" in request_payload:
        try:
            request_payload["icon_type"] = IconType(request_payload["icon_type"])
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST.value, f"Invalid icon type: {request_payload['icon_type']}")

    template.name = request_payload.get("name", template.name)
    template.icon_type = request_payload.get("icon_type", template.icon_type)
    template.icon_key = request_payload.get("icon_key", template.icon_key)

    try:
        database.session.commit()
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    include_fields.load_file_counts(database.session, [template])
    return jsonify(Transform.template(template, **include_fields(template)))


def validate_new_template_dto(data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate new template DTO.

    Returns:
        error message and a list invalid fields.
    """

    expected_fields = {"name", "icon_type", "icon_key"}
    missing_fields = expected_fields - set(data.keys())
    if missing_fields:
        return f"Payload must have the following fields: {expected_fields}", {
            field: ValidationErrors.MISSING_REQUIRED.value for field in missing_fields
        }

    try:
        data["icon_type"] = IconType(data["icon_type"])
    except ValueError:
        return f"Invalid icon type: {data['icon_type']}", {"icon_type": ValidationErrors.INVALID_VALUE.value}

    if not isinstance(data["name"], str):
        return "Name must be a unique non empty string", {"name": ValidationErrors.INVALID_VALUE.value}

    if len(data["name"].strip()) == 0:
        return "Name must be a unique non empty string", {"name": ValidationErrors.MISSING_REQUIRED.value}

    name_exists = database.session.query(Template).filter(Template.name == data["name"]).count() > 0
    if name_exists:
        return f"Template name already exists: {data['name']}", {"name": ValidationErrors.UNIQUE_VIOLATION.value}

    return None, {}


@api.route("/templates/", methods=["POST"])
def create_template():
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_new_template_dto(request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

    # Create template
    template = Template(**request_payload)
    template.name = template.name.strip()
    database.session.add(template)

    # Try to commit session
    try:
        database.session.commit()
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")

    return jsonify(Transform.template(template, examples=False))


@api.route("/templates/<int:template_id>", methods=["DELETE"])
def delete_template(template_id):
    # Fetch template from database
    template = database.session.query(Template).get(template_id)

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    # Delete example
    database.session.delete(template)
    database.session.commit()
    return "", HTTPStatus.NO_CONTENT.value


@api.route("/templates/<int:template_id>/examples/", methods=["GET"])
def list_template_examples(template_id):
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)

    # Fetch template from database
    template = database.session.query(Template).get(template_id)

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    # Fetch template examples
    query = database.session.query(TemplateExample).options(defer(TemplateExample.features))
    query = query.filter(TemplateExample.template_id == template_id)
    query = query.options(defer(TemplateExample.features))

    total = query.count()
    examples = query.limit(limit).offset(offset).all()
    return jsonify(
        {
            "items": [Transform.template_example(example, template=False) for example in examples],
            "template": Transform.template(template, examples=False),
            "total": total,
            "offset": offset,
        }
    )


@api.route("/templates/<int:template_id>/examples/<int:example_id>", methods=["GET"])
def get_template_example(template_id, example_id):
    # Fetch template example from database
    query = database.session.query(TemplateExample).filter(TemplateExample.id == example_id)
    query = query.filter(TemplateExample.template_id == template_id)
    query = query.options(defer(TemplateExample.features))
    example = query.one_or_none()

    # Handle example not found
    if example is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Example not found: id={example_id}, template_id={template_id}")

    return jsonify(Transform.template_example(example, template=True))


@api.route("/templates/<int:template_id>/examples/<int:example_id>", methods=["DELETE"])
def delete_template_example(template_id, example_id):
    # Fetch template example from database
    query = database.session.query(TemplateExample).filter(TemplateExample.id == example_id)
    query = query.filter(TemplateExample.template_id == template_id)
    query = query.options(defer(TemplateExample.features))
    example = query.one_or_none()

    # Handle example not found
    if example is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Example not found: id={example_id}, template_id={template_id}")

    # Delete example
    database.session.delete(example)
    database.session.commit()
    file_storage = get_file_storage()
    file_storage.delete(example.storage_key)
    return "", HTTPStatus.NO_CONTENT.value


ALLOWED_TYPES = {".jpg", ".jpeg", ".png", ".bmp", ".bmp", ".gif"}


@api.route("/templates/<int:template_id>/examples/", methods=["POST"])
def upload_example(template_id):
    # Fetch template from database
    template = database.session.query(Template).get(template_id)

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    # check if the post request has the file part
    if "file" not in request.files:
        abort(HTTPStatus.NOT_FOUND.value, "No file part")

    file = request.files["file"]

    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == "":
        abort(HTTPStatus.NOT_FOUND.value, "No selected file")

    # Check for file type
    if file and Path(file.filename).suffix not in ALLOWED_TYPES:
        abort(HTTPStatus.NOT_FOUND.value, f"File type must be one of the {ALLOWED_TYPES}")

    with tempfile.TemporaryDirectory(prefix=f"template-{template.name}-") as tempdir:
        # Save file to local directory
        filename = secure_filename(file.filename)
        save_path = os.path.join(tempdir, filename)
        file.save(save_path)

        # Put file to the file storage
        file_storage = get_file_storage()
        storage_key = file_storage.save_file(save_path)

        # Create and return a new template example
        example = TemplateExample(template=template, storage_key=storage_key)
        database.session.add(example)
        database.session.commit()
        return jsonify(Transform.template_example(example, template=True))
