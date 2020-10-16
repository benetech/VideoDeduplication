from flask import jsonify, request
from sqlalchemy.orm import joinedload

from db.files_dao import FilesDAO
from db.schema import Matches, Files
from .blueprint import api
from .helpers import parse_positive_int, Fields, parse_enum_seq
from ..model import Transform, database

# Optional file fields
FILE_FIELDS = Fields(Files.exif, Files.signature, Files.meta, Files.scenes)


@api.route('/files/<int:file_id>/matches', methods=['GET'])
def list_file_matches(file_id):
    limit = parse_positive_int(request.args, 'limit', 20)
    offset = parse_positive_int(request.args, 'offset', 0)
    # hops = parse_positive_int(request.args, "hops", 1)
    # min_distance = parse_positive_float(request.args, '')
    include_fields = parse_enum_seq(request.args, 'include', values=FILE_FIELDS.names, default=())

    query = FilesDAO.file_matches(file_id, database.session).options(
        joinedload(Matches.match_video_file),
        joinedload(Matches.query_video_file)
    )

    # Preload file fields
    query = FILE_FIELDS.preload(query, include_fields, Matches.match_video_file)
    query = FILE_FIELDS.preload(query, include_fields, Matches.query_video_file)

    # Get requested slice
    total = query.count()
    items = query.offset(offset).limit(limit).all()

    include_flags = {field: True for field in include_fields}
    return jsonify({
        'items': [Transform.file_match_dict(item, file_id, **include_flags) for item in items],
        'total': total
    })
