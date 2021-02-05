import sys

from db import Database
from db.schema import Repository
from winnow.config import Config
from winnow.config.path import resolve_config_path
from winnow.pipeline.progress_monitor import ProgressBar
from winnow.remote import make_client
from winnow.remote.helpers import DatabaseConnector
from .database import DatabaseCli
from .db_getter import DBGetterCli
from .errors import handle_errors
from .pipeline import PipelineCli
from .repo import RepoCli
from ..platform.arguments import get_repo_connector
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
        connector = get_repo_connector(repo_name=repo, config=self._config)
        connector.push_all(chunk_size=1, progress=ProgressBar(file=sys.stdout, unit="fingerprints"))
