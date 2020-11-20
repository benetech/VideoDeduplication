from dataclasses import dataclass, field
from datetime import datetime
from typing import List

from sqlalchemy import or_, func, literal_column
from sqlalchemy.orm import aliased

from db.schema import Files, Matches, Exif


class FileMatchFilter:
    """Enum for file match filtering criteria."""
    ALL = "all"
    RELATED = "related"
    DUPLICATES = "duplicates"
    UNIQUE = "unique"

    values = {ALL, RELATED, DUPLICATES, UNIQUE}


class FileSort:
    """Enum for result ordering."""
    DATE = "date"
    LENGTH = "length"
    RELATED = "related"
    DUPLICATES = "duplicates"

    values = {DATE, LENGTH, RELATED, DUPLICATES}


@dataclass
class ListFilesRequest:
    """Parameters for list-files query."""

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
    preload: list = field(default_factory=list)
    sort: str = None
    match_filter: str = FileMatchFilter.ALL
    related_distance: float = 0.4
    duplicate_distance: float = 0.1


@dataclass
class Counts:
    """Count of files by matches."""
    total: int
    related: int
    duplicates: int
    unique: int


@dataclass
class ListFilesResults:
    """Results of list-files query."""
    items: List[Files]
    counts: Counts


class FilesDAO:
    """Data-access object for files."""

    # Label for related entities count (matches, scenes, etc.)
    _LABEL_COUNT = "hit_count"
    _countable_match = aliased(Matches)

    @staticmethod
    def list_files(req: ListFilesRequest, session) -> ListFilesResults:
        """Query multiple files."""
        # Count files
        query = session.query(Files)
        query = FilesDAO._filter_by_file_attributes(req, query)
        counts = FilesDAO.counts(query, req.related_distance, req.duplicate_distance)

        # Select files
        sortable_attributes = FilesDAO._sortable_attributes(req)
        query = session.query(Files, *sortable_attributes)
        query = FilesDAO._filter_by_file_attributes(req, query)
        query = FilesDAO._filter_by_matches(req, query)
        query = FilesDAO._sort_items(req, query)

        # Retrieve slice
        query = query.offset(req.offset).limit(req.limit)
        items = query.all()

        # Get files from result set if there are additional attributes.
        if len(sortable_attributes) > 0:
            items = [item[0] for item in items]

        return ListFilesResults(items=items, counts=counts)

    @staticmethod
    def counts(query, related_distance, duplicate_distance):
        """Count queried files by matches."""
        total = query.count()
        duplicates = query.filter(FilesDAO.has_matches(duplicate_distance)).count()
        related = query.filter(FilesDAO.has_matches(related_distance)).count()
        unique = total - related
        return Counts(
            total=total,
            related=related,
            duplicates=duplicates,
            unique=unique)

    @staticmethod
    def has_matches(threshold):
        """Create a filter criteria to check if there is a match
        with distance lesser or equal to the given threshold."""
        return or_(Files.source_matches.any(Matches.distance <= threshold),
                   Files.target_matches.any(Matches.distance <= threshold))

    @staticmethod
    def file_matches(file_id, session):
        """Query for all file matches."""
        return session.query(Matches).filter(or_(
            Matches.query_video_file_id == file_id,
            Matches.match_video_file_id == file_id
        ))

    @staticmethod
    def _sortable_attributes(req: ListFilesRequest):
        """Get additional sortable attributes."""
        values = []
        if req.sort == FileSort.RELATED or req.sort == FileSort.DUPLICATES:
            match_count = func.count(FilesDAO._countable_match.id).label(FilesDAO._LABEL_COUNT)
            values.append(match_count)
        return values

    @staticmethod
    def _sort_items(req: ListFilesRequest, query):
        """Apply ordering."""
        if req.sort == FileSort.RELATED or req.sort == FileSort.DUPLICATES:
            match = FilesDAO._countable_match
            threshold = req.related_distance if req.sort == FileSort.RELATED else req.duplicate_distance
            query = query.outerjoin(FilesDAO._countable_match,
                                    ((match.query_video_file_id == Files.id) |
                                     (match.match_video_file_id == Files.id)) & (match.distance < threshold))
            return query.group_by(Files.id).order_by(literal_column(FilesDAO._LABEL_COUNT).desc(), Files.id.asc())
        elif req.sort == FileSort.LENGTH:
            exif = aliased(Exif)
            return query.outerjoin(exif).order_by(exif.General_Duration.desc(), Files.id.asc())
        elif req.sort == FileSort.DATE:
            exif = aliased(Exif)
            return query.outerjoin(exif).order_by(exif.General_Encoded_Date.desc(), Files.id.asc())
        return query

    @staticmethod
    def _filter_path(req: ListFilesRequest, query):
        """Filter by file name."""
        if req.path_query:
            return query.filter(Files.file_path.ilike(f"%{req.path_query}%"))
        return query

    @staticmethod
    def _filter_extensions(req: ListFilesRequest, query):
        """Filter by file extension."""
        if req.extensions:
            conditions = (Files.file_path.ilike(f"%.{ext}") for ext in req.extensions)
            return query.filter(or_(*conditions))
        return query

    @staticmethod
    def _filter_exif(req: ListFilesRequest, query):
        """Filter by EXIF data presence."""
        if req.exif is not None:
            has_exif = Files.exif.has()
            if req.exif:
                return query.filter(has_exif)
            else:
                return query.filter(~has_exif)
        return query

    @staticmethod
    def _filter_audio(req: ListFilesRequest, query):
        """Filter by audio presence."""
        if req.audio is not None:
            has_audio = Files.exif.has(Exif.Audio_Duration > 0)
            if req.audio:
                return query.filter(has_audio)
            else:
                return query.filter(~has_audio)
        return query

    @staticmethod
    def _filter_date(req: ListFilesRequest, query):
        """Filter by creation date."""
        if req.date_from is not None:
            query = query.filter(
                Files.exif.has(Exif.General_Encoded_Date >= req.date_from))

        if req.date_to is not None:
            query = query.filter(
                Files.exif.has(Exif.General_Encoded_Date <= req.date_to))

        return query

    @staticmethod
    def _filter_length(req: ListFilesRequest, query):
        """Filter by length."""
        if req.min_length is not None or req.max_length is not None:
            query = query.join(Files.exif)

        if req.min_length is not None:
            query = query.filter(Exif.General_Duration >= req.min_length)

        if req.max_length is not None:
            query = query.filter(Exif.General_Duration <= req.max_length)

        return query

    @staticmethod
    def _filter_by_matches(req: ListFilesRequest, query):
        """Filter by presence of similar files."""
        if req.match_filter == FileMatchFilter.DUPLICATES:
            return query.filter(FilesDAO.has_matches(req.duplicate_distance))
        elif req.match_filter == FileMatchFilter.RELATED:
            return query.filter(FilesDAO.has_matches(req.related_distance))
        elif req.match_filter == FileMatchFilter.UNIQUE:
            return query.filter(~FilesDAO.has_matches(req.related_distance))
        # else MatchCategory.ALL
        return query

    @staticmethod
    def _filter_by_file_attributes(req: ListFilesRequest, query):
        """Apply filters related to the properties of video file itself."""
        query = FilesDAO._filter_path(req, query)
        query = FilesDAO._filter_extensions(req, query)
        query = FilesDAO._filter_exif(req, query)
        query = FilesDAO._filter_audio(req, query)
        query = FilesDAO._filter_date(req, query)
        query = FilesDAO._filter_length(req, query)
        return query
