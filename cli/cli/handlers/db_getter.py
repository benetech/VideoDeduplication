import sys
from typing import Optional, List

from cli.handlers.errors import handle_errors
from cli.handlers.repo import RepoCli
from cli.platform.formatters import Format, resolve_formatter
from cli.platform.transform import Transform
from cli.platform.validate import positive_int, boolean, valid_date, valid_enum, valid_sequence, valid_duration_millis
from db import Database
from db.access.files import FileMatchFilter, FileSort, ListFilesRequest, FilesDAO, FileInclude
from db.access.matches import MatchesDAO

# Maximal amount of items to be fetched at a time
ITEMS_CHUNK = 100


class DBGetterCli:
    """Show processing results."""

    def __init__(self, config):
        self._config = config

    @handle_errors
    def files(
        self,
        path: Optional[str] = None,
        offset: int = 0,
        limit: int = 1000,
        exif: Optional[bool] = None,
        audio: Optional[bool] = None,
        min_length: Optional[int] = None,
        max_length: Optional[int] = None,
        extensions: Optional[List[str]] = (),
        date_from=None,
        date_to=None,
        match: FileMatchFilter = FileMatchFilter.ALL.value,
        sort: FileSort = FileSort.LENGTH.value,
        hash: Optional[str] = None,
        remote: bool = False,
        repo: Optional[str] = None,
        contributor: Optional[str] = None,
        output: str = Format.PLAIN.value,
        fields: List[str] = ("path", "length_human", "hash_short", "fingerprint_short"),
    ):
        """Get processed files from the database."""
        path = str(path) if path is not None else None
        hash = str(hash) if hash is not None else None
        req = ListFilesRequest()
        req.limit = positive_int("limit", limit)
        req.offset = positive_int("offset", offset)
        req.path_query = path
        req.exif = boolean("exif", exif)
        req.audio = boolean("audio", audio)
        req.min_length = valid_duration_millis("min_length", min_length)
        req.max_length = valid_duration_millis("max_length", max_length)
        req.include = [FileInclude.exif, FileInclude.scenes, FileInclude.meta]
        req.extensions = extensions
        req.date_from = valid_date("date_from", date_from)
        req.date_to = valid_date("date_to", date_to)
        req.match_filter = valid_enum("match", match, FileMatchFilter)
        req.sort = valid_enum("sort", sort, FileSort)
        req.sha256 = hash
        req.remote = boolean("remote", remote) or (repo is not None) or (contributor is not None)
        req.repository = repo
        req.contributor = contributor
        output = valid_enum("output", output, Format)
        fields = valid_sequence("fields", fields, Transform.FILE_FIELDS, required=False)

        database = Database(self._config.database.uri)
        with database.session_scope(expunge=True) as session:
            results = FilesDAO.list_files(req, session)
            files = [Transform.file(file) for file in results.items]
            formatter = resolve_formatter(format=output)
            formatter.format(
                files, fields, file=sys.stdout, highlights={"path": path, "hash": hash, "hash_short": hash}
            )

    @handle_errors
    def repos(self, name=None, offset=0, limit=1000, output=Format.PLAIN.value, fields=Transform.REPO_FIELDS):
        """List known fingerprint repositories."""
        repo_cli = RepoCli(config=self._config)
        repo_cli.list(name=name, offset=offset, limit=limit, output=output, fields=fields)

    @handle_errors
    def matches(
        self,
        path=None,
        min_distance=None,
        max_distance=None,
        limit=1000,
        offset=0,
        output=Format.PLAIN.value,
        fields=Transform.MATCH_FIELDS,
    ):
        """List file matches."""
        output = valid_enum("output", output, Format)
        limit = positive_int("limit", limit)
        offset = positive_int("offset", offset)
        fields = valid_sequence("fields", fields, admissible_values=Transform.MATCH_FIELDS)

        # Query matches
        database = Database(self._config.database.uri)
        with database.session_scope() as session:
            matches = MatchesDAO.list_matches_query(
                session, path=path, min_distance=min_distance, max_distance=max_distance, limit=limit, offset=offset
            ).all()
            items = [Transform.match(match) for match in matches]
            formatter = resolve_formatter(format=output)
            formatter.format(items, fields, file=sys.stdout, highlights={"source": path, "target": path})
