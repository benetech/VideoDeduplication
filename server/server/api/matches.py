from flask import jsonify, request, g, url_for, current_app
from db.schema import Matches
from .blueprint import api


@api.route('/matches/')
def get_matches():
    page = request.args.get('page', 1, type=int)
    pagination = Matches.query.paginate(
        page, per_page=10,
        error_out=False)
    matches = pagination.items

    prev = None
    if pagination.has_prev:
        prev = url_for('api.get_matches', page=page - 1)
    next = None
    if pagination.has_next:
        next = url_for('api.get_matches', page=page + 1)
    return jsonify({
        'posts': [match.to_json() for match in matches],
        'prev': prev,
        'next': next,
        'count': pagination.total
    })
