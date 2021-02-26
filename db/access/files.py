import enum
from datetime import datetime
from typing import List, Optional, Iterator

from dataclasses import dataclass, field
from sqlalchemy import or_, func, literal_column, tuple_
from sqlalchemy.orm import aliased, Query, Session, joinedload

from db.schema import Files, Matches, Exif, Contributor, Repository, Signature
from winnow.utils.iterators import chunks


class FileMatchFilter(enum.Enum):
    """Enum for file match filtering criteria."""

    ALL = "all"
    RELATED = "related"
    DUPLICATES = "duplicates"
    UNIQUE = "unique"


class FileSort(enum.Enum):
    """Enum for result ordering."""

    DATE = "date"
    LENGTH = "length"
    RELATED = "related"
    DUPLICATES = "duplicates"


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
    sort: Optional[FileSort] = None
    match_filter: FileMatchFilter = FileMatchFilter.ALL
    related_distance: float = 0.4
    duplicate_distance: float = 0.1
    remote: bool = False
    contributor: Optional[str] = None
    repository: Optional[str] = None
    sha256: str = None


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
        return Counts(total=total, related=related, duplicates=duplicates, unique=unique)

    @staticmethod
    def has_matches(threshold):
        """Create a filter criteria to check if there is a match
        with distance lesser or equal to the given threshold."""
        return or_(
            Files.source_matches.any(Matches.distance <= threshold),
            Files.target_matches.any(Matches.distance <= threshold),
        )

    @staticmethod
    def file_matches(file_id, session: Session) -> Query:
        """Query for all file matches."""
        return session.query(Matches).filter(
            or_(Matches.query_video_file_id == file_id, Matches.match_video_file_id == file_id)
        )

    @staticmethod
    def _sortable_attributes(req: ListFilesRequest):
        """Get additional sortable attributes."""
        values = []
        if req.sort == FileSort.RELATED or req.sort == FileSort.DUPLICATES:
            match_count = func.count(FilesDAO._countable_match.id).label(FilesDAO._LABEL_COUNT)
            values.append(match_count)
        return values

    @staticmethod
    def _sort_items(req: ListFilesRequest, query: Query) -> Query:
        """Apply ordering."""
        if req.sort == FileSort.RELATED or req.sort == FileSort.DUPLICATES:
            match = FilesDAO._countable_match
            threshold = req.related_distance if req.sort == FileSort.RELATED else req.duplicate_distance
            query = query.outerjoin(
                FilesDAO._countable_match,
                ((match.query_video_file_id == Files.id) | (match.match_video_file_id == Files.id))
                & (match.distance < threshold),
            )
            return query.group_by(Files.id).order_by(literal_column(FilesDAO._LABEL_COUNT).desc(), Files.id.asc())
        elif req.sort == FileSort.LENGTH:
            exif = aliased(Exif)
            return query.outerjoin(exif).order_by(exif.General_Duration.desc(), Files.id.asc())
        elif req.sort == FileSort.DATE:
            exif = aliased(Exif)
            return query.outerjoin(exif).order_by(exif.General_Encoded_Date.desc(), Files.id.asc())
        return query

    @staticmethod
    def _filter_path(req: ListFilesRequest, query: Query) -> Query:
        """Filter by file name."""
        if req.path_query:
            return query.filter(Files.file_path.ilike(f"%{req.path_query}%"))
        return query

    @staticmethod
    def _filter_extensions(req: ListFilesRequest, query: Query) -> Query:
        """Filter by file extension."""
        if req.extensions:
            conditions = (Files.file_path.ilike(f"%.{ext}") for ext in req.extensions)
            return query.filter(or_(*conditions))
        return query

    @staticmethod
    def _filter_exif(req: ListFilesRequest, query: Query) -> Query:
        """Filter by EXIF data presence."""
        if req.exif is not None:
            has_exif = Files.exif.has()
            if req.exif:
                return query.filter(has_exif)
            else:
                return query.filter(~has_exif)
        return query

    @staticmethod
    def _filter_audio(req: ListFilesRequest, query: Query) -> Query:
        """Filter by audio presence."""
        if req.audio is not None:
            has_audio = Files.exif.has(Exif.Audio_Duration > 0)
            if req.audio:
                return query.filter(has_audio)
            else:
                return query.filter(~has_audio)
        return query

    @staticmethod
    def _filter_date(req: ListFilesRequest, query: Query) -> Query:
        """Filter by creation date."""
        if req.date_from is not None:
            query = query.filter(Files.exif.has(Exif.General_Encoded_Date >= req.date_from))

        if req.date_to is not None:
            query = query.filter(Files.exif.has(Exif.General_Encoded_Date <= req.date_to))

        return query

    @staticmethod
    def _filter_length(req: ListFilesRequest, query: Query) -> Query:
        """Filter by length."""
        if req.min_length is not None or req.max_length is not None:
            query = query.join(Files.exif)

        if req.min_length is not None:
            query = query.filter(Exif.General_Duration >= req.min_length)

        if req.max_length is not None:
            query = query.filter(Exif.General_Duration <= req.max_length)

        return query

    @staticmethod
    def _filter_hash(req: ListFilesRequest, query: Query) -> Query:
        """Filter file by hash."""
        if req.sha256:
            return query.filter(Files.sha256.ilike(f"%{req.sha256}%"))
        return query

    @staticmethod
    def _filter_by_matches(req: ListFilesRequest, query: Query) -> Query:
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
    def _filter_remote(req: ListFilesRequest, query: Query) -> Query:
        """Filter by local/external origin."""
        if req.remote is None:
            return query
        if req.remote:
            return query.filter(Files.contributor != None)  # noqa: E711
        return query.filter(Files.contributor == None)  # noqa: E711

    @staticmethod
    def _filter_repository(req: ListFilesRequest, query: Query) -> Query:
        """Filter by repository name (external files only)."""
        if req.repository is not None:
            return query.filter(Files.contributor.has(Contributor.repository.has(Repository.name == req.repository)))
        return query

    @staticmethod
    def _filter_contributor(req: ListFilesRequest, query: Query):
        """Filter by contributor name (external files only)."""
        if req.contributor is not None:
            return query.filter(Files.contributor.has(Contributor.name == req.contributor))
        return query

    @staticmethod
    def _filter_by_file_attributes(req: ListFilesRequest, query: Query):
        """Apply filters related to the properties of video file itself."""
        query = FilesDAO._filter_path(req, query)
        query = FilesDAO._filter_extensions(req, query)
        query = FilesDAO._filter_exif(req, query)
        query = FilesDAO._filter_audio(req, query)
        query = FilesDAO._filter_date(req, query)
        query = FilesDAO._filter_length(req, query)
        query = FilesDAO._filter_hash(req, query)
        query = FilesDAO._filter_remote(req, query)
        query = FilesDAO._filter_repository(req, query)
        query = FilesDAO._filter_contributor(req, query)
        return query

    @staticmethod
    def query_local_files(session: Session, path_hash_pairs) -> Query:
        """Query local files by (path, hash) pairs."""
        query = session.query(Files).filter(Files.contributor == None)  # noqa: E711
        query = query.filter(tuple_(Files.file_path, Files.sha256).in_(tuple(path_hash_pairs)))
        return query

    @staticmethod
    def query_remote_files(session: Session, repository_name: str = None, contributor_name: str = None) -> Query:
        """Query remote signatures from database."""
        query = session.query(Files).filter(Files.contributor != None)  # noqa: E711
        query = query.options(joinedload(Files.signature), joinedload(Files.contributor))

        # Apply repository filters
        if repository_name is not None:
            query = query.filter(Files.contributor.has(Contributor.repository.has(Repository.name == repository_name)))

        # Apply contributor filters
        if contributor_name is not None:
            query = query.filter(Files.contributor.has(Contributor.name == contributor_name))

        return query

    @staticmethod
    def select_missing_signatures(path_hash_pairs, session: Session, chunk_size=1000) -> Iterator[Files]:
        """Query files with missing signatures."""
        for chunk in chunks(path_hash_pairs, size=chunk_size):
            query = session.query(Files).filter(Files.signature.has(Signature.signature != None))  # noqa: E711
            query = query.filter(tuple_(Files.file_path, Files.sha256).in_(chunk)).yield_per(chunk_size)
            have_signature = set((file.file_path, file.sha256) for file in query)
            yield from set(chunk) - have_signature
