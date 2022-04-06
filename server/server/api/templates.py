import enum
import os
import tempfile
from http import HTTPStatus
from numbers import Number
from pathlib import Path
from typing import Dict, Tuple, List

from flask import jsonify, request, abort
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import defer, joinedload, Session
from werkzeug.utils import secure_filename

from db.access.templates import TemplatesDAO
from db.schema import Template, TemplateExample, IconType, Files
from thumbnail.ffmpeg import extract_frame_tmp
from .blueprint import api
from .constants import ValidationErrors
from .helpers import (
    parse_positive_int,
    get_file_storage,
    parse_enum_seq,
    parse_enum,
    resolve_video_file_path,
)
from ..model import database, Transform


class TemplateFields(enum.Enum):
    examples = "examples"
    file_count = "file_count"


class TemplateFieldsLoader:
    """Template field inclusion manager."""

    examples: bool = False
    file_count: bool = False

    def __init__(self, args, name="include", default=()):
        include_fields = parse_enum_seq(args, name, enum_class=TemplateFields, default=default)
        self.examples = TemplateFields.examples in include_fields
        self.file_count = TemplateFields.file_count in include_fields
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
    include_fields = TemplateFieldsLoader(request.args)

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
    include_fields = TemplateFieldsLoader(request.args)

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


def validate_update_template_dto(template, data: Dict) -> Tuple[str, Dict[str, str]]:
    """Validate update-template DTO.

    Returns:
        error message and a dict of invalid fields -> error codes.
    """

    expected_fields = {"name", "icon_type", "icon_key"}
    actual_fields = set(data.keys())
    if not actual_fields <= expected_fields:
        return f"Payload can include only the following fields: {expected_fields}", {}

    if "icon_type" in data:
        try:
            data["icon_type"] = IconType(data["icon_type"])
        except ValueError:
            return f"Invalid icon type: {data['icon_type']}", {"icon_type": ValidationErrors.INVALID_VALUE.value}

    if "name" not in data:
        return None, {}

    if data["name"] is None:
        return "Name cannot be null", {"name": ValidationErrors.MISSING_REQUIRED.value}

    if not isinstance(data["name"], str):
        return "Name must be a string value", {"name": ValidationErrors.INVALID_VALUE.value}

    data["name"] = data["name"].strip()
    if len(data["name"]) == 0:
        return "Name cannot be empty", {"name": ValidationErrors.MISSING_REQUIRED.value}

    name_exists = database.session.query(Template).filter(Template.name == data["name"]).count() > 0
    if name_exists and data["name"] != template.name:
        return f"Template name already exists: {data['name']}", {"name": ValidationErrors.UNIQUE_VIOLATION.value}

    return None, {}


@api.route("/templates/<int:template_id>", methods=["PATCH"])
def update_template(template_id):
    include_fields = TemplateFieldsLoader(request.args)

    # Fetch template from database
    query = database.session.query(Template).filter(Template.id == template_id)
    if include_fields.examples:
        query = query.options(joinedload(Template.examples).options(defer(TemplateExample.features)))
    template = query.one_or_none()

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    # Get payload
    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    # Validate payload
    error, fields = validate_update_template_dto(template, request_payload)
    if error is not None:
        return (
            jsonify({"error": error, "code": HTTPStatus.BAD_REQUEST.value, "fields": fields}),
            HTTPStatus.BAD_REQUEST.value,
        )

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
        error message and a dict of invalid fields -> error codes.
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

    data["name"] = data["name"].strip()
    if len(data["name"]) == 0:
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


class CreateExampleMethod(enum.Enum):
    """Methods to create examples."""

    UPLOAD = "upload"
    FRAME = "frame"


@api.route("/templates/<int:template_id>/examples/", methods=["POST"])
def add_example(template_id):
    # Get example creation method
    method = parse_enum(request.args, name="method", enum_class=CreateExampleMethod, default=CreateExampleMethod.UPLOAD)

    # Fetch template from database
    template = database.session.query(Template).get(template_id)

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    if method == CreateExampleMethod.UPLOAD:
        return handle_upload_example(template)
    elif method == CreateExampleMethod.FRAME:
        return handle_create_example_from_frame(template)


def handle_upload_example(template: Template):
    """Do upload example image."""

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


def validate_frame_dto(data: Dict) -> str:
    """Validate create-from-frame DTO."""

    expected_fields = {"file_id", "time"}
    missing_fields = expected_fields - set(data.keys())
    if missing_fields:
        return f"Missing payload attributes: {','.join(missing_fields)}"

    file_id, time = data["file_id"], data["time"]
    if not isinstance(file_id, int):
        return f"Invalid file_id: {file_id}"

    file = database.session.query(Files).filter(Files.id == file_id).first()
    if file is None:
        return f"File id not found: {file_id}"

    # Handle remote files
    if not file.file_path:
        file_descr = f"{file.contributor.repository.name}:{file.contributor.name}:{file.sha256}"
        return f"Cannot read frame from remote file: {file_descr}"

    if not isinstance(time, Number) or time < 0:
        return f"Invalid time: {time}"


def handle_create_example_from_frame(template: Template):
    """Create example from the"""

    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    error = validate_frame_dto(request_payload)
    if error:
        abort(HTTPStatus.BAD_REQUEST.value, error)

    file_id, time = request_payload["file_id"], int(request_payload["time"])
    file = database.session.query(Files).filter(Files.id == file_id).first()

    try:
        example = create_example_from_frame(template, file, time, database.session)
        database.session.commit()
        return jsonify(Transform.template_example(example, template=True))
    except ValueError as e:
        abort(HTTPStatus.BAD_REQUEST.value, str(e))
    except IntegrityError:
        abort(HTTPStatus.BAD_REQUEST.value, "Data integrity violation.")


def create_example_from_frame(template: Template, file: Files, time: int, session) -> TemplateExample:
    """Do create template example from file frame."""
    video_path = resolve_video_file_path(file.file_path)
    if not os.path.isfile(video_path):
        raise ValueError(f"Video file is missing: {file.file_path}")
    frame_path = extract_frame_tmp(video_path, position=time, width=resolve_frame_width(file))
    if frame_path is None:
        raise ValueError(f"Timestamp exceeds video length: {time}")

    # Put file to the file storage
    file_storage = get_file_storage()
    storage_key = file_storage.save_file(frame_path)

    # Create and return a new template example
    example = TemplateExample(template=template, storage_key=storage_key)
    session.add(example)
    return example


def resolve_frame_width(file: Files, default: int = 320) -> int:
    if file.exif is not None and file.exif.Video_Width is not None:
        return file.exif.Video_Width
    return default
