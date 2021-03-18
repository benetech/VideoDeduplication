from http import HTTPStatus

from flask import jsonify, request, abort
from sqlalchemy.orm import defer

from db.schema import TemplateExample
from .blueprint import api
from .helpers import (
    parse_positive_int,
    Fields,
    parse_fields,
)
from ..model import database, Transform

EXAMPLE_FIELDS = Fields(TemplateExample.template)


@api.route("/examples/", methods=["GET"])
def list_examples():
    include_fields = parse_fields(request.args, "include", EXAMPLE_FIELDS)
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    template_id = parse_positive_int(request.args, "template_id")

    # Fetch template examples
    query = database.session.query(TemplateExample).options(defer(TemplateExample.features))
    query = query.options(defer(TemplateExample.features))
    if template_id is not None:
        query = query.filter(TemplateExample.template_id == template_id)

    total = query.count()
    examples = query.limit(limit).offset(offset).all()

    include_flags = {field.key: True for field in include_fields}
    return jsonify(
        {
            "items": [Transform.template_example(example, **include_flags) for example in examples],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/examples/<int:example_id>", methods=["GET"])
def get_example(example_id):
    include_fields = parse_fields(request.args, "include", EXAMPLE_FIELDS)

    # Fetch template example from database
    query = database.session.query(TemplateExample).filter(TemplateExample.id == example_id)
    query = query.options(defer(TemplateExample.features))
    example = query.one_or_none()

    # Handle example not found
    if example is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Example not found: id={example_id}")

    include_flags = {field.key: True for field in include_fields}
    return jsonify(Transform.template_example(example, **include_flags))


@api.route("/examples/<int:example_id>", methods=["DELETE"])
def delete_example(example_id):
    include_fields = parse_fields(request.args, "include", EXAMPLE_FIELDS)

    # Fetch template example from database
    query = database.session.query(TemplateExample).filter(TemplateExample.id == example_id)
    query = query.options(defer(TemplateExample.features))
    example = query.one_or_none()

    # Handle example not found
    if example is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Example not found: id={example_id}")

    # Delete example
    database.session.delete(example)
    return "", HTTPStatus.NO_CONTENT.value
