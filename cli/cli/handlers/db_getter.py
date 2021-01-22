import sys

from cli.console.validate import positive_int, boolean, valid_date, valid_enum, valid_sequence
from cli.formatters import Format, resolve_formatter
from cli.handlers.errors import handle_errors
from cli.handlers.repo import RepoCli
from cli.transform import Transform
from db import Database
from db.access.files import FileMatchFilter, FileSort, ListFilesRequest, FilesDAO
from db.schema import Files

# Maximal amount of items to be fetched at a time
ITEMS_CHUNK = 100


class DBGetterCli:
    """Show processing results."""

    def __init__(self, config):
        self._config = config

    @handle_errors
    def files(
        self,
        path=None,
        offset=0,
        limit=1000,
        exif=None,
        audio=None,
        min_length=None,
        max_length=None,
        extensions=(),
        date_from=None,
        date_to=None,
        match=FileMatchFilter.ALL.value,
        sort=FileSort.LENGTH.value,
        hash=None,
        output=Format.PLAIN.value,
        fields=("path", "length_human", "hash_short", "fingerprint_short"),
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
        req.min_length = positive_int("min_length", min_length)
        req.max_length = positive_int("max_length", max_length)
        req.preload = [Files.exif, Files.scenes, Files.meta]
        req.extensions = extensions
        req.date_from = valid_date("date_from", date_from)
        req.date_to = valid_date("date_to", date_to)
        req.match_filter = valid_enum("match", match, FileMatchFilter)
        req.sort = valid_enum("sort", sort, FileSort)
        req.sha256 = hash
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

    def repos(self, name=None, offset=0, limit=1000, output=Format.PLAIN.value, fields=Transform.REPO_FIELDS):
        """List known fingerprint repositories."""
        repo_cli = RepoCli(config=self._config)
        repo_cli.list(name=name, offset=offset, limit=limit, output=output, fields=fields)
