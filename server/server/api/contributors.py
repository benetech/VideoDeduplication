from http import HTTPStatus
from typing import Tuple

from flask import jsonify, request, abort
from sqlalchemy import func, distinct

from db.schema import Contributor, Files
from .blueprint import api
from .helpers import (
    parse_positive_int,
)
from ..model import database, Transform, ContributorStats


def make_stats(entry: Tuple[Contributor, int]) -> Tuple[Contributor, ContributorStats]:
    """Make (repository,stats) pair from list-query results entry."""
    contributor, pulled_count = entry
    stats = ContributorStats(
        total_fingerprints_count=contributor.fingerprints_count,
        pulled_fingerprints_count=pulled_count,
    )
    return contributor, stats


@api.route("/contributors/", methods=["GET"])
def list_contributors():
    limit = parse_positive_int(request.args, "limit", 100)
    offset = parse_positive_int(request.args, "offset", 0)
    name = request.args.get("name", "", type=str).strip()
    repo_id = parse_positive_int(request.args, "repository_id")

    query = (
        database.session.query(Contributor, func.count(distinct(Files.id)))
        .outerjoin(Contributor.files)
        .group_by(Contributor.id)
    )

    # Apply optional name filter
    if name:
        query = query.filter(Contributor.name.ilike(f"%{name}%"))

    if repo_id is not None:
        query = query.filter(Contributor.repository_id == repo_id)

    total = query.count()
    entries = query.limit(limit).offset(offset).all()
    return jsonify(
        {
            "items": [
                Transform.contributor(contributor, stats=stats) for (contributor, stats) in map(make_stats, entries)
            ],
            "total": total,
            "offset": offset,
        }
    )


@api.route("/contributors/<int:contributor_id>", methods=["GET"])
def get_contributor(contributor_id):
    # Fetch contributor from database
    entry = (
        database.session.query(Contributor, func.count(distinct(Files.id)))
        .outerjoin(Contributor.files)
        .group_by(Contributor.id)
        .one_or_none()
    )

    # Handle contributor not found
    if entry is None:
        abort(HTTPStatus.NOT_FOUND.value, f"Contributor id not found: {contributor_id}")

    contributor, stats = make_stats(entry)

    return jsonify(Transform.contributor(contributor, repository=True, stats=stats))
