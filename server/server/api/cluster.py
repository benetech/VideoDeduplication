from http import HTTPStatus

from flask import jsonify, request, abort

from db.access.matches import FileMatchesRequest, MatchesDAO
from db.schema import Files
from .blueprint import api
from .helpers import parse_positive_int, parse_positive_float, parse_fields
from db.access.fields import Fields
from ..model import Transform, database

# Optional file fields
FILE_FIELDS = Fields(Files.exif, Files.signature, Files.meta, Files.scenes)


def parse_params(file):
    """Parse request parameters."""
    req = FileMatchesRequest(file=file)
    req.limit = parse_positive_int(request.args, "limit", 20)
    req.offset = parse_positive_int(request.args, "offset", 0)
    req.hops = parse_positive_int(request.args, "hops", 1)
    req.min_distance = parse_positive_float(request.args, "min_distance", 0.0)
    req.max_distance = parse_positive_float(request.args, "max_distance", 1.0)
    req.preload = parse_fields(request.args, "include", FILE_FIELDS)
    return req


@api.route("/files/<int:file_id>/cluster", methods=["GET"])
def fetch_file_cluster(file_id):
    file = database.session.query(Files).get(file_id)

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    req = parse_params(file)
    resp = MatchesDAO.list_file_matches(req, database.session)

    include_flags = {field.key: True for field in req.preload}
    return jsonify(
        {
            "files": [Transform.file(file, **include_flags) for file in resp.files],
            "matches": [Transform.match(match) for match in resp.matches],
            "total": resp.total,
            "hops": req.hops,
        }
    )
