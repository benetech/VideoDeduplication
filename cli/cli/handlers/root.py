from db import Database
from db.schema import Repository
from winnow.config import Config
from winnow.config.path import resolve_config_path
from winnow.remote import make_client
from winnow.remote.helpers import push_database_fingerprints
from .database import DatabaseCli
from .db_getter import DBGetterCli
from .errors import handle_errors
from .pipeline import PipelineCli
from .repo import RepoCli
from ..platform.error import CliError


class RootCli:
    """
    Command-line interface for managing video-deduplication application.

    'just' - is acronym for JusticeAI.
    """

    def __init__(self, config=None):
        self._config = Config.read(resolve_config_path(config))
        self._config.read_env()
        self.db = DatabaseCli(self._config)
        self.get = DBGetterCli(self._config)
        self.repo = RepoCli(self._config)
        self.process = PipelineCli(self._config)

    @handle_errors
    def push(self, repo: str):
        """Push all local fingerprints to the remote repository."""
        database = Database(self._config.database.uri)
        with database.session_scope(expunge=True) as session:
            repository = session.query(Repository).filter(Repository.name == repo).one_or_none()
        if repository is None:
            raise CliError(f"Unknown repository: {repo}")
        repo_client = make_client(repository, self._config)
        push_database_fingerprints(database, repo_client, chunk_size=100)
