from http import HTTPStatus

from flask import jsonify, request, abort
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from db.schema import Files
from .blueprint import api
from ..model import database, Transform


class Arguments:
    """Collection of methods to preprocess REST arguments"""

    # Query options for additional fields that could be included on demand
    ADDITIONAL_FIELDS = {
        "meta": joinedload(Files.meta),
        "signature": joinedload(Files.signature),
        "exif": joinedload(Files.exif),
        "scenes": joinedload(Files.scenes),
    }

    @staticmethod
    def extensions():
        """File extensions to search"""
        extensions = request.args.get('extensions', '', type=str)
        extensions = [ext.strip() for ext in extensions.split(',')]
        extensions = [ext for ext in extensions if len(ext) > 0]
        return extensions

    @staticmethod
    def include():
        """Additional fields to include"""
        fields = request.args.get('include', '', type=str)
        fields = set(field.strip() for field in fields.split(','))
        options = [Arguments.ADDITIONAL_FIELDS[field] for field in fields if field in Arguments.ADDITIONAL_FIELDS]
        include = {field: (field in fields) for field in Arguments.ADDITIONAL_FIELDS}
        return include, options

    @staticmethod
    def validate(limit, offset):
        """Validate arguments"""

        if limit < 0:
            abort(HTTPStatus.BAD_REQUEST.value, "'limit' cannot be negative")

        if offset < 0:
            abort(HTTPStatus.BAD_REQUEST.value, "'offset' cannot be negative")


@api.route('/files/', methods=['GET'])
def list_files():
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    path_query = request.args.get('path', '', type=str).strip()  # TODO: update Web UI
    extensions = Arguments.extensions()
    include, include_options = Arguments.include()

    Arguments.validate(limit, offset)

    query = database.session.query(Files).options(*include_options)

    # Apply filtering criteria

    if path_query:
        query = query.filter(Files.file_path.ilike(f"%{path_query}%"))

    if extensions:
        conditions = (Files.original_filename.ilike(f"%.{ext}") for ext in extensions)
        query = query.filter(or_(*conditions))

    # Get requested slice
    total = query.count()
    items = query.offset(offset).limit(limit).all()

    return jsonify({
        'items': [Transform.dict(item, matches=False, **include) for item in items],
        'total': total
    })


@api.route('/files/<int:file_id>', methods=['GET'])
def get_file(file_id):
    include, include_options = Arguments.include()

    # Fetch file from database
    query = database.session.query(Files)
    query = query.options(*include_options)
    file = query.filter(Files.id == file_id).first()

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    return jsonify(Transform.dict(file, matches=False, **include))
