from cli.console.color import highlight
from cli.console.validate import positive_int, boolean, valid_date, valid_enum

# Maximal amount of items to be fetched at a time
from cli.handlers.errors import handle_errors
from db import Database
from db.access.files import FileMatchFilter, FileSort, ListFilesRequest, FilesDAO, ListFilesResults
from db.schema import Files

ITEMS_CHUNK = 100


class DBGetterCli:
    """Show processing results."""

    def __init__(self, config):
        self._config = config

    @handle_errors
    def files(
        self,
        offset=0,
        limit=1000,
        name=None,
        exif=None,
        audio=None,
        min_length=None,
        max_length=None,
        extensions=(),
        date_from=None,
        date_to=None,
        match=FileMatchFilter.ALL,
        sort=FileSort.LENGTH,
        output="plain",
    ):
        """Get processed files from the database."""
        req = ListFilesRequest()
        req.limit = positive_int("limit", limit)
        req.offset = positive_int("offset", offset)
        req.path_query = name
        req.exif = boolean("exif", exif)
        req.audio = boolean("audio", audio)
        req.min_length = positive_int("min_length", min_length)
        req.max_length = positive_int("max_length", max_length)
        req.preload = [Files.exif, Files.scenes, Files.meta]
        req.extensions = extensions
        req.date_from = valid_date("date_from", date_from)
        req.date_to = valid_date("date_to", date_to)
        req.match_filter = valid_enum("match", match, FileMatchFilter.values)
        req.sort = valid_enum("sort", sort, FileSort.values)
        output = valid_enum("output", output, {"plain", "json", "yaml", "csv", "wide"})

        database = Database(self._config.database.uri)
        with database.session_scope(expunge=True) as session:
            results = FilesDAO.list_files(req, session)

        self._print_files(results, name, output)

    @staticmethod
    def _print_files(results: ListFilesResults, name, output):
        if output == "plain":
            for file in results.items:
                print(highlight(file.file_path, str(name or "")))
