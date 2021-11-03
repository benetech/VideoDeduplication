import abc
import enum
import itertools
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Iterator, Set

from sqlalchemy import or_, and_, func, literal_column, tuple_
from sqlalchemy.orm import aliased, Query, Session, joinedload

from db.schema import Files, Matches, Exif, Contributor, Repository, Signature, TemplateMatches, Template


# TODO: Improve dependency management and get rid of duplicate code (#295)
def _chunks(iterable, size=100):
    """Split iterable into equal-sized chunks."""
    iterator = iter(iterable)
    chunk = list(itertools.islice(iterator, size))
    while chunk:
        yield chunk
        chunk = list(itertools.islice(iterator, size))


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


class FileInclude(enum.Enum):
    """Data that could be included into query results."""

    EXIF = "exif"
    META = "meta"
    SIGNATURE = "signature"
    SCENES = "scenes"
    DUPLICATES = "duplicates"
    RELATED = "related"
    TEMPLATES = "templates"


# Some of the included data are mapped to the File fields.
_FILE_FIELDS = {
    FileInclude.EXIF: Files.exif,
    FileInclude.META: Files.meta,
    FileInclude.SIGNATURE: Files.signature,
    FileInclude.SCENES: Files.scenes,
}


def get_file_fields(included_fields: Set[FileInclude]):
    return {_FILE_FIELDS.get(field_id) for field_id in included_fields if field_id in _FILE_FIELDS}


@dataclass
class ListFilesRequest:
    """Parameters for list-files query."""

    limit: int = 20
    offset: int = 0
    path_query: str = None
    extensions: List[str] = ()
    exif: bool = None
    audio: bool = None
    min_length: int = None
    max_length: int = None
    date_from: datetime = None
    date_to: datetime = None
    include: List[FileInclude] = ()
    sort: Optional[FileSort] = None
    match_filter: FileMatchFilter = FileMatchFilter.ALL
    related_distance: float = 0.4
    duplicate_distance: float = 0.1
    remote: bool = False
    contributor: Optional[str] = None
    repository: Optional[str] = None
    sha256: str = None
    templates: Optional[List[int]] = None


@dataclass
class Counts:
    """Count of files by matches."""

    total: int
    related: int
    duplicates: int
    unique: int


@dataclass
class FileData:
    """Retrieved File along with some additional data."""

    file: Files
    duplicate_count: Optional[int] = None
    related_count: Optional[int] = None
    matched_templates: Optional[List[int]] = None


class QueryValueLoader(abc.ABC):
    """Some value (file, match count, etc.) that must be retrieved from the database."""

    @property
    @abc.abstractmethod
    def value(self):
        """Value that should be passed to Session.query(*values, **values) method."""

    @abc.abstractmethod
    def advice_query(self, req: ListFilesRequest, query: Query) -> Query:
        """Modify query if needed."""

    @abc.abstractmethod
    def write_result(self, value, result: FileData):
        """Write result value to file data object."""

    @staticmethod
    @abc.abstractmethod
    def make_loader(req: ListFilesRequest) -> Optional:
        """Create value loaders according to the request."""


class MatchCount(QueryValueLoader):
    """Basic match count loader."""

    def __init__(self, label: str = "match_count"):
        self._label = label
        self._match_alias = aliased(Matches)

    @property
    def value(self):
        return func.count(self._match_alias.id).label(self._label)

    def _query_match_count(self, query: Query, distance_threshold: float) -> Query:
        """Join by matches count."""
        match = self._match_alias
        return query.outerjoin(
            match,
            ((match.query_video_file_id == Files.id) | (match.match_video_file_id == Files.id))
            & (match.distance < distance_threshold),
        ).group_by(Files.id)

    def _sort_by_match_count(self, query: Query) -> Query:
        """Sort by match count."""
        return query.order_by(literal_column(self._label).desc(), Files.id.asc())


class DuplicateCount(MatchCount):
    """Duplicate count loader."""

    def __init__(self):
        super().__init__(label="duplicate_count")

    def advice_query(self, req: ListFilesRequest, query: Query) -> Query:
        query = self._query_match_count(query, req.duplicate_distance)
        if req.sort == FileSort.DUPLICATES:
            query = self._sort_by_match_count(query)
        return query

    def write_result(self, value, result: FileData):
        result.duplicate_count = value

    @staticmethod
    def make_loader(req: ListFilesRequest) -> Optional[QueryValueLoader]:
        if req.sort == FileSort.DUPLICATES or FileInclude.DUPLICATES in req.include:
            return DuplicateCount()


class RelatedCount(MatchCount):
    """Duplicate count loader."""

    def __init__(self):
        super().__init__(label="related_count")

    def advice_query(self, req: ListFilesRequest, query: Query) -> Query:
        query = self._query_match_count(query, req.related_distance)
        if req.sort == FileSort.RELATED:
            query = self._sort_by_match_count(query)
        return query

    def write_result(self, value, result: FileData):
        result.related_count = value

    @staticmethod
    def make_loader(req: ListFilesRequest) -> Optional[QueryValueLoader]:
        if req.sort == FileSort.RELATED or FileInclude.RELATED in req.include:
            return RelatedCount()


class TemplateIds(QueryValueLoader):
    """Matched template ids."""

    @property
    def value(self):
        return func.array_agg(Template.id)

    def advice_query(self, req: ListFilesRequest, query: Query) -> Query:
        return query.outerjoin(
            Template,
            Template.matches.any(TemplateMatches.file_id == Files.id),
        ).group_by(Files.id)

    def write_result(self, value, result: FileData):
        result.matched_templates = tuple(set(item for item in value if item is not None))

    @staticmethod
    def make_loader(req: ListFilesRequest) -> Optional[QueryValueLoader]:
        if FileInclude.TEMPLATES in req.include:
            return TemplateIds()


# Available additional value loaders
_VALUE_LOADERS = (RelatedCount, DuplicateCount, TemplateIds)


@dataclass
class ListFilesResults:
    """Results of list-files query."""

    items: List[FileData]
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
        included_values = FilesDAO._make_loaders(req)
        query = session.query(Files, *(included.value for included in included_values))
        query = FilesDAO._filter_by_file_attributes(req, query)
        query = FilesDAO._filter_by_matches(req, query)
        query = FilesDAO._advice_query(query, req, included_values)
        query = FilesDAO._sort_items(req, query)

        # Retrieve slice
        query = query.offset(req.offset).limit(req.limit)
        items = FilesDAO._collect_items(query.all(), included_values)

        return ListFilesResults(items=items, counts=counts)

    @staticmethod
    def counts(query, related_distance, duplicate_distance) -> Counts:
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
            Files.source_matches.any(
                and_(Matches.distance <= threshold, Matches.false_positive == False)  # noqa: E712
            ),
            Files.target_matches.any(
                and_(Matches.distance <= threshold, Matches.false_positive == False)  # noqa: E712
            ),
        )

    @staticmethod
    def file_matches(file_id, session: Session, *, false_positive=False) -> Query:
        """Query for all file matches."""
        query = session.query(Matches).filter(
            or_(Matches.query_video_file_id == file_id, Matches.match_video_file_id == file_id)
        )
        if false_positive is not None:
            query = query.filter(Matches.false_positive == false_positive)
        return query

    @staticmethod
    def _make_loaders(req: ListFilesRequest, loader_types=_VALUE_LOADERS) -> List[QueryValueLoader]:
        """Get loaders for required values."""
        result = []
        for loader_type in loader_types:
            loader = loader_type.make_loader(req)
            if loader is not None:
                result.append(loader)
        return result

    @staticmethod
    def _advice_query(query: Query, req: ListFilesRequest, included: List[QueryValueLoader]) -> Query:
        """Apply query loaders."""
        for value_loader in included:
            query = value_loader.advice_query(req, query)
        return query

    @staticmethod
    def _collect_items(items: List, included_values: List[QueryValueLoader]) -> List[FileData]:
        """Convert query results to FileData list."""
        if len(included_values) == 0:
            # Each item is a File entity
            return list(map(FileData, items))

        # Otherwise each item is a tuple of values
        result = []
        for item in items:
            file_data = FileData(file=item[0])
            # Write extra values to the result item
            for value, loader in zip(item[1:], included_values):
                loader.write_result(value, file_data)
            result.append(file_data)
        return result

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
        if req.sort == FileSort.LENGTH:
            exif = aliased(Exif)
            return (
                query.outerjoin(exif).group_by(Files.id, exif.id).order_by(exif.General_Duration.desc(), Files.id.asc())
            )
        elif req.sort == FileSort.DATE:
            exif = aliased(Exif)
            return (
                query.outerjoin(exif)
                .group_by(Files.id, exif.id)
                .order_by(exif.General_Encoded_Date.desc(), Files.id.asc())
            )
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
    def _filter_contributor(req: ListFilesRequest, query: Query) -> Query:
        """Filter by contributor name (external files only)."""
        if req.contributor is not None:
            return query.filter(Files.contributor.has(Contributor.name == req.contributor))
        return query

    @staticmethod
    def _filter_templates(req: ListFilesRequest, query: Query) -> Query:
        """Filter files by matched template ids."""
        if req.templates is not None and len(req.templates) > 0:
            return query.filter(
                Files.template_matches.any(
                    and_(
                        TemplateMatches.template_id.in_(tuple(req.templates)),
                        TemplateMatches.false_positive == False,  # noqa: E712
                    )
                )
            )
        return query

    @staticmethod
    def _filter_by_file_attributes(req: ListFilesRequest, query: Query) -> Query:
        """Apply filters related to the properties of video file itself."""
        query = FilesDAO._filter_path(req, query)
        query = FilesDAO._filter_extensions(req, query)
        query = FilesDAO._filter_audio(req, query)
        query = FilesDAO._filter_date(req, query)
        query = FilesDAO._filter_length(req, query)
        query = FilesDAO._filter_hash(req, query)
        query = FilesDAO._filter_remote(req, query)
        query = FilesDAO._filter_repository(req, query)
        query = FilesDAO._filter_contributor(req, query)
        query = FilesDAO._filter_templates(req, query)
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
        query = query.options(
            joinedload(Files.signature),
            joinedload(Files.contributor),
            joinedload(Files.contributor, Contributor.repository),
        )

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
        for chunk in _chunks(path_hash_pairs, size=chunk_size):
            query = session.query(Files).filter(Files.signature.has(Signature.signature != None))  # noqa: E711
            query = query.filter(tuple_(Files.file_path, Files.sha256).in_(chunk)).yield_per(chunk_size)
            have_signature = set((file.file_path, file.sha256) for file in query)
            yield from set(chunk) - have_signature
