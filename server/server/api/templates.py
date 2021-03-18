from http import HTTPStatus

from flask import jsonify, request, abort
from sqlalchemy.orm import defer, joinedload

from db.schema import Template, TemplateExample
from .blueprint import api
from .helpers import (
    parse_positive_int,
    Fields,
    parse_fields,
)
from ..model import database, Transform

TEMPLATE_FIELDS = Fields(Template.examples)


@api.route("/templates/", methods=["GET"])
def list_templates():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    include_fields = parse_fields(request.args, "include", TEMPLATE_FIELDS)

    query = database.session.query(Template)
    if Template.examples in include_fields:
        query = query.options(joinedload(Template.examples).options(defer(TemplateExample.features)))

    total = query.count()
    templates = query.limit(limit).offset(offset).all()

    include_flags = {field.key: True for field in include_fields}
    return jsonify(
        {
            "items": [Transform.template(template, **include_flags) for template in templates],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/templates/<int:template_id>", methods=["GET"])
def get_template(template_id):
    include_fields = parse_fields(request.args, "include", TEMPLATE_FIELDS)

    # Fetch template from database
    query = database.session.query(Template)
    if Template.examples in include_fields:
        query = query.options(joinedload(Template.examples).options(defer(TemplateExample.features)))
    template = query.get(template_id)

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    include_flags = {field.key: True for field in include_fields}
    return jsonify(Transform.template(template, **include_flags))


@api.route("/templates/<int:template_id>", methods=["PATCH"])
def update_template(template_id):
    include_fields = parse_fields(request.args, "include", TEMPLATE_FIELDS)

    # Fetch template from database
    query = database.session.query(Template)
    if Template.examples in include_fields:
        query = query.options(joinedload(Template.examples).options(defer(TemplateExample.features)))
    template = query.get(template_id)

    # Handle template not found
    if template is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Template id not found: {template_id}")

    request_payload = request.get_json()
    if request_payload is None:
        abort(HTTPStatus.BAD_REQUEST.value, "Expected valid 'application/json' payload.")

    expected_fields = {"name", "icon_type", "icon_key"}
    if not set(request_payload.keys()) < {"name", "icon_type", "icon_key"}:
        abort(HTTPStatus.BAD_REQUEST.value, f"Payload can include only the following fields: {expected_fields}")

    template.name = request_payload.get("name", template.name)
    template.icon_type = request_payload.get("icon_type", template.icon_type)
    template.icon_key = request_payload.get("icon_key", template.icon_key)

    include_flags = {field.key: True for field in include_fields}
    return jsonify(Transform.template(template, **include_flags))


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
    return "", HTTPStatus.NO_CONTENT.value
