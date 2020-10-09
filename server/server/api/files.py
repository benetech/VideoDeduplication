from datetime import datetime
from http import HTTPStatus
from typing import List, Dict

from dataclasses import dataclass, field
from flask import jsonify, request, abort
from sqlalchemy import or_, func, literal_column
from sqlalchemy.orm import aliased

from db.schema import Files, Exif, VideoMetadata, Matches, Signature, Scene
from .blueprint import api
from .helpers import file_matches, parse_boolean, parse_positive_int, parse_date, parse_enum, get_config, has_matches
from ..model import database, Transform


class MatchCategory:
    """Enum for match distance criteria."""
    ALL = "all"
    RELATED = "related"
    DUPLICATES = "duplicates"
    UNIQUE = "unique"

    values = {ALL, RELATED, DUPLICATES, UNIQUE}


class Sort:
    """Enum for result ordering."""
    DATE = "date"
    LENGTH = "length"
    RELATED = "related"
    DUPLICATES = "duplicates"

    values = {DATE, LENGTH, RELATED, DUPLICATES}


@dataclass
class Counts:
    """Count of files by matches."""
    total: int = 0
    related: int = 0
    duplicates: int = 0
    unique: int = 0

    @staticmethod
    def get(query, related_distance, duplicate_distance):
        """Count queried files by matches."""
        total = query.count()
        duplicates = query.filter(has_matches(duplicate_distance)).count()
        related = query.filter(has_matches(related_distance)).count()
        unique = total - related
        return Counts(total=total, related=related, duplicates=duplicates, unique=unique)


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
    match_category: str = MatchCategory.ALL
    sort: str = None

    # Query options for additional fields that could be included on demand
    _ADDITIONAL_FIELDS = {
        "meta": (Files.meta, VideoMetadata),
        "signature": (Files.signature, Signature),
        "exif": (Files.exif, Exif),
        "scenes": (Files.scenes, Scene),
    }

    # Format in which Dates are currently stored in exif table.
    _EXIF_DATE_FORMAT = " UTC %Y-%m-%d 00"

    # Label for related entities count (matches, scenes, etc.)
    _LABEL_COUNT = "hit_count"
    _countable_match = aliased(Matches)

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
        result.match_category = parse_enum(request.args, "matches",
                                           values=MatchCategory.values,
                                           default=MatchCategory.ALL)
        result.sort = parse_enum(request.args, "sort", values=Sort.values, default=None)
        return result

    def sortable_attributes(self):
        """Get additional sortable attributes."""
        values = []
        if self.sort == Sort.RELATED or self.sort == Sort.DUPLICATES:
            match_count = func.count(self._countable_match.id).label(self._LABEL_COUNT)
            values.append(match_count)
        return values

    def sort_items(self, query, related_distance, duplicate_distance):
        """Apply ordering."""
        if self.sort == Sort.RELATED or self.sort == Sort.DUPLICATES:
            match = self._countable_match
            threshold = related_distance if self.sort == Sort.RELATED else duplicate_distance
            query = query.outerjoin(self._countable_match,
                                    ((match.query_video_file_id == Files.id) |
                                     (match.match_video_file_id == Files.id)) & (match.distance < threshold))
            return query.group_by(Files.id).order_by(literal_column(self._LABEL_COUNT).desc(), Files.id.asc())
        elif self.sort == Sort.LENGTH:
            meta = aliased(VideoMetadata)
            return query.outerjoin(meta).order_by(meta.video_length.desc(), Files.id.asc())
        elif self.sort == Sort.DATE:
            exif = aliased(Exif)
            return query.outerjoin(exif).order_by(exif.General_Encoded_Date.desc(), Files.id.asc())
        return query

    def filter_path(self, query):
        """Filter by file name."""
        if self.path_query:
            return query.filter(Files.file_path.ilike(f"%{self.path_query}%"))
        return query

    def filter_extensions(self, query):
        """Filter by file extension."""
        if self.extensions:
            conditions = (Files.file_path.ilike(f"%.{ext}") for ext in self.extensions)
            return query.filter(or_(*conditions))
        return query

    def filter_exif(self, query):
        """Filter by EXIF data presence."""
        if self.exif is not None:
            has_exif = Files.exif.has()
            if self.exif:
                return query.filter(has_exif)
            else:
                return query.filter(~has_exif)
        return query

    def filter_audio(self, query):
        """Filter by audio presence."""
        if self.audio is not None:
            has_audio = Files.exif.has(Exif.Audio_Duration > 0)
            if self.audio:
                return query.filter(has_audio)
            else:
                return query.filter(~has_audio)
        return query

    def filter_date(self, query):
        """Filter by creation date."""
        if self.date_from is not None:
            query = query.filter(
                Files.exif.has(Exif.General_Encoded_Date >= self.date_from.strftime(self._EXIF_DATE_FORMAT)))

        if self.date_to is not None:
            query = query.filter(
                Files.exif.has(Exif.General_Encoded_Date <= self.date_to.strftime(self._EXIF_DATE_FORMAT)))

        return query

    def filter_length(self, query):
        """Filter by length."""
        if self.min_length is not None or self.max_length is not None:
            query = query.join(Files.meta)

        if self.min_length is not None:
            query = query.filter(VideoMetadata.video_length >= self.min_length)

        if self.max_length is not None:
            query = query.filter(VideoMetadata.video_length <= self.max_length)

        return query

    def filter_by_matches(self, query, related_distance, duplicate_distance):
        """Filter by presence of similar files."""
        if self.match_category == MatchCategory.DUPLICATES:
            return query.filter(has_matches(duplicate_distance))
        elif self.match_category == MatchCategory.RELATED:
            return query.filter(has_matches(related_distance))
        elif self.match_category == MatchCategory.UNIQUE:
            return query.filter(~has_matches(related_distance))
        # else MatchCategory.ALL
        return query

    def filter_by_file_attributes(self, query):
        """Apply filters related to the properties of video file itself."""
        query = self.filter_path(query)
        query = self.filter_extensions(query)
        query = self.filter_exif(query)
        query = self.filter_audio(query)
        query = self.filter_date(query)
        query = self.filter_length(query)
        return query


@api.route('/files/', methods=['GET'])
def list_files():
    args = Arguments.parse()

    # Count files
    config = get_config()
    query = database.session.query(Files)
    query = args.filter_by_file_attributes(query)
    counts = Counts.get(query, config.related_distance, config.duplicate_distance)

    # Select files
    sortable_attributes = args.sortable_attributes()
    query = database.session.query(Files, *sortable_attributes)
    query = args.filter_by_file_attributes(query)
    query = args.filter_by_matches(query, config.related_distance, config.duplicate_distance)
    query = args.sort_items(query, config.related_distance, config.duplicate_distance)

    # Retrieve slice
    query = query.offset(args.offset).limit(args.limit)
    items = query.all()

    # Get files from result set if there are additional attributes.
    if len(sortable_attributes) > 0:
        items = [item[0] for item in items]

    return jsonify({
        'items': [Transform.file_dict(item, **args.include) for item in items],
        'total': counts.total,
        'duplicates': counts.duplicates,
        'related': counts.related,
        'unique': counts.unique
    })


@api.route('/files/<int:file_id>', methods=['GET'])
def get_file(file_id):
    include = Arguments.parse_include()

    # Fetch file from database
    query = database.session.query(Files)
    file = query.filter(Files.id == file_id).first()

    # Handle file not found
    if file is None:
        abort(HTTPStatus.NOT_FOUND.value, f"File id not found: {file_id}")

    data = Transform.file_dict(file, **include)
    data["matches_count"] = file_matches(file_id).count()
    return jsonify(data)
