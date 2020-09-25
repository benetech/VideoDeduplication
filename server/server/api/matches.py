from http import HTTPStatus

from flask import jsonify, request, abort
from sqlalchemy.orm import joinedload

from db.schema import Matches
from .blueprint import api
from .helpers import file_matches
from ..model import Transform


class Arguments:
    """REST API arguments preprocessing"""

    @staticmethod
    def validate(limit, offset):
        """Validate arguments"""

        if limit < 0:
            abort(HTTPStatus.BAD_REQUEST.value, "'limit' cannot be negative")

        if offset < 0:
            abort(HTTPStatus.BAD_REQUEST.value, "'offset' cannot be negative")


@api.route('/files/<int:file_id>/matches', methods=['GET'])
def list_file_matches(file_id):
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)

    Arguments.validate(limit, offset)

    query = file_matches(file_id).options(
        joinedload(Matches.match_video_file),
        joinedload(Matches.query_video_file)
    )

    # Get requested slice
    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return jsonify({
        'items': [Transform.file_match_dict(item, file_id) for item in items],
        'total': total
    })
