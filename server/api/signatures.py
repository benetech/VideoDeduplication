# import sys
# sys.path.append('..')

from flask import jsonify, request, g, url_for, current_app
from model import Signature
from . import api

@api.route('/signatures/')
def get_signatures():
    page = request.args.get('page', 1, type=int)
    pagination = Signature.query.paginate(
        page, per_page=10,
        error_out=False)
    signatures = pagination.items
    
    prev = None
    if pagination.has_prev:
        prev = url_for('api.get_signatures', page=page-1)
    next = None
    if pagination.has_next:
        next = url_for('api.get_signatures', page=page+1)
    return jsonify({
        'posts': [signature.to_json() for signature in signatures],
        'prev': prev,
        'next': next,
        'count': pagination.total
    })
