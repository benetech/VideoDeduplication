from datetime import datetime
from http import HTTPStatus
from typing import List, Dict

from dataclasses import dataclass, field
from flask import jsonify, request, abort
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from db.schema import Files, Exif, VideoMetadata
from .blueprint import api
from .helpers import file_matches, parse_boolean, parse_positive_int, parse_date
from ..model import database, Transform


@dataclass
class Arguments:
    """Parsed request arguments."""

    # Request parameters:
    limit: int = 20
    offset: int = 0
    path_query: str = None
    extensions: List[str] = field(default_factory=list)
    exif: bool = None
    audio: bool = None
    min_length: int = None
    max_length: int = None
    date_from: datetime = None
    date_to: datetime = None
    include: Dict[str, bool] = field(default_factory=dict)

    # Query options for additional fields that could be included on demand
    _ADDITIONAL_FIELDS = {
        "meta": joinedload(Files.meta),
        "signature": joinedload(Files.signature),
        "exif": joinedload(Files.exif),
        "scenes": joinedload(Files.scenes),
    }

    # Format in which Dates are currently stored in exif table.
    _EXIF_DATE_FORMAT = " UTC %Y-%m-%d 00"

    @staticmethod
    def parse_extensions():
        """File extensions to search"""
        extensions = request.args.get('extensions', '', type=str)
        extensions = [ext.strip() for ext in extensions.split(',')]
        extensions = [ext for ext in extensions if len(ext) > 0]
        return extensions

    @staticmethod
    def parse_include():
        """Additional fields to include"""
        fields = request.args.get('include', '', type=str)
        fields = set(field.strip() for field in fields.split(','))
        include = {field: (field in fields) for field in Arguments._ADDITIONAL_FIELDS}
        return include

    @staticmethod
    def include_options(include):
        """Query options to retrieve included fields."""
        return [Arguments._ADDITIONAL_FIELDS[field] for field in include if field in Arguments._ADDITIONAL_FIELDS]

    @staticmethod
    def parse():
        """Parse and validate request arguments."""
        result = Arguments()
        result.limit = parse_positive_int(request.args, 'limit', 20)
        result.offset = parse_positive_int(request.args, 'offset', 0)
        result.path_query = request.args.get('path', '', type=str).strip()
        result.exif = parse_boolean(request.args, 'exif')
        result.audio = parse_boolean(request.args, 'audio')
        result.min_length = parse_positive_int(request.args, 'min_length')
        result.max_length = parse_positive_int(request.args, 'max_length')
        result.include = Arguments.parse_include()
        result.extensions = Arguments.parse_extensions()
        result.date_from = parse_date(request.args, "date_from")
        result.date_to = parse_date(request.args, "date_to")
        return result

    def query(self):
        # Create query
        include_options = self.include_options(self.include)
        query = database.session.query(Files).options(*include_options)

        # Apply filtering criteria
        if self.path_query:
            query = query.filter(Files.file_path.ilike(f"%{self.path_query}%"))

        if self.extensions:
            conditions = (Files.file_path.ilike(f"%.{ext}") for ext in self.extensions)
            query = query.filter(or_(*conditions))

        if self.exif is not None:
            has_exif = Files.exif.has()
            if self.exif:
                query = query.filter(has_exif)
            else:
                query = query.filter(~has_exif)

        if self.audio is not None:
            has_audio = Files.exif.has(Exif.Audio_Duration > 0)
            if self.audio:
                query = query.filter(has_audio)
            else:
                query = query.filter(~has_audio)

        if self.date_from is not None:
            query = query.filter(
                Files.exif.has(Exif.General_Encoded_Date >= self.date_from.strftime(self._EXIF_DATE_FORMAT)))

        if self.date_to is not None:
            query = query.filter(
                Files.exif.has(Exif.General_Encoded_Date <= self.date_to.strftime(self._EXIF_DATE_FORMAT)))

        if self.min_length is not None or self.max_length is not None:
            query = query.join(Files.meta)

        if self.min_length is not None:
            query = query.filter(VideoMetadata.video_length >= self.min_length)

        if self.max_length is not None:
            query = query.filter(VideoMetadata.video_length <= self.max_length)

        return query


@api.route('/files/', methods=['GET'])
def list_files():
    args = Arguments.parse()
    query = args.query()

    # Get requested slice
    total = query.count()
    items = query.offset(args.offset).limit(args.limit).all()

    return jsonify({
        'items': [Transform.file_dict(item, **args.include) for item in items],
        'total': total
    })


@api.route('/files/<int:file_id>', methods=['GET'])
def get_file(file_id):
    include = Arguments.parse_include()
    include_options = Arguments.include_options(include)

    # Fetch file from database
    query = database.session.query(Files)
    query = query.options(*include_options)
    file = query.filter(Files.id == file_id).first()

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    data = Transform.file_dict(file, **include)
    data["matches_count"] = file_matches(file_id).count()
    return jsonify(data)
