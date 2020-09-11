from http import HTTPStatus

from flask import jsonify, request, abort
from sqlalchemy.orm import joinedload

from db.schema import Matches
from .blueprint import api
from ..model import database, Transform


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
def list_matches(file_id):
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)

    Arguments.validate(limit, offset)

    query = database.session.query(Matches).options(joinedload(Matches.match_video_file))
    query = query.filter(Matches.query_video_file_id == file_id)

    # Get requested slice
    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return jsonify({
        'items': [Transform.dict(item, query_video_file=False) for item in items],
        'total': total
    })
