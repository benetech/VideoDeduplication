from http import HTTPStatus

from flask import jsonify, request, abort

from db.schema import Contributor
from .blueprint import api
from .helpers import (
    parse_positive_int,
)
from ..model import database, Transform


@api.route("/contributors/", methods=["GET"])
def list_contributors():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    name = request.args.get("name", "", type=str).strip()
    repo_id = parse_positive_int(request.args, "repository_id")

    query = database.session.query(Contributor)

    # Apply optional name filter
    if name:
        query = query.filter(Contributor.name.ilike(f"%{name}%"))

    if repo_id is not None:
        query = query.filter(Contributor.repository_id == repo_id)

    total = query.count()
    contributors = query.limit(limit).offset(offset).all()
    return jsonify(
        {
            "items": [Transform.contributor(contributor) for contributor in contributors],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/contributors/<int:contributor_id>", methods=["GET"])
def get_contributor(contributor_id):
    # Fetch contributor from database
    contributor = database.session.query(Contributor).get(contributor_id)

    # Handle contributor not found
    if contributor is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Contributor id not found: {contributor_id}")

    return jsonify(Transform.contributor(contributor))
