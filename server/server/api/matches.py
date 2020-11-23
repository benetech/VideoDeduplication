from http import HTTPStatus

from flask import jsonify, request, abort
from sqlalchemy.orm import joinedload

from db.access.files import FilesDAO
from db.schema import Matches, Files
from .blueprint import api
from .helpers import parse_positive_int, Fields, parse_fields
from ..model import Transform, database

# Optional file fields
FILE_FIELDS = Fields(Files.exif, Files.signature, Files.meta, Files.scenes)


@api.route("/files/<int:file_id>/matches", methods=["GET"])
def list_file_matches(file_id):
    limit = parse_positive_int(request.args, "limit", 20)
    offset = parse_positive_int(request.args, "offset", 0)
    include_fields = parse_fields(request.args, "include", FILE_FIELDS)

    file = database.session.query(Files).get(file_id)

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    query = FilesDAO.file_matches(file_id, database.session).options(
        joinedload(Matches.match_video_file), joinedload(Matches.query_video_file)
    )

    # Preload file fields
    query = FILE_FIELDS.preload(query, include_fields, Matches.match_video_file)
    query = FILE_FIELDS.preload(query, include_fields, Matches.query_video_file)

    # Get requested slice
    total = query.count()
    items = query.offset(offset).limit(limit).all()

    include_flags = {field.key: True for field in include_fields}
    return jsonify(
        {
            "items": [Transform.file_match_dict(item, file_id, **include_flags) for item in items],
            "total": total,
            "offset": offset,
        }
    )
