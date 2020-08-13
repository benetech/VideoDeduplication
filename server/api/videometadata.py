# import sys
# sys.path.append('..')

from flask import jsonify, request, g, url_for, current_app
from model import VideoMetadata
from .blueprint import api


@api.route('/videometadata/')
def get_videometadata():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = VideoMetadata.query.paginate(page, per_page, error_out=False)
    videometadata = pagination.items

    prev = None
    if pagination.has_prev:
        prev = url_for('api.get_videometadata', page=page - 1, per_page=per_page)
    next = None
    if pagination.has_next:
        next = url_for('api.get_videometadata', page=page + 1, per_page=per_page)
    return jsonify({
        'posts': [videometa.to_json() for videometa in videometadata],
        'prev': prev,
        'next': next,
        'count': pagination.total
    })
