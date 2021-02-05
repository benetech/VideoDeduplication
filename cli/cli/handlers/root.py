import sys

from winnow.config import Config
from winnow.config.path import resolve_config_path
from winnow.pipeline.progress_monitor import ProgressBar
from .database import DatabaseCli
from .db_getter import DBGetterCli
from .errors import handle_errors
from .pipeline import PipelineCli
from .repo import RepoCli
from ..platform.arguments import get_repo_connector
from ..platform.validate import positive_int


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
    def push(self, repo: str, chunk_size: int = 100):
        """Push all local fingerprints to the remote repository."""
        chunk_size = positive_int(name="chunk_size", value=chunk_size)
        connector = get_repo_connector(repo_name=repo, config=self._config)
        connector.push_all(chunk_size=chunk_size, progress=ProgressBar(file=sys.stdout, unit="fingerprints"))

    @handle_errors
    def pull(self, repo: str, chunk_size: int = 100):
        """Pull all local fingerprints from the remote repository."""
        chunk_size = positive_int(name="chunk_size", value=chunk_size)
        connector = get_repo_connector(repo_name=repo, config=self._config)
        connector.pull_all(chunk_size=chunk_size, progress=ProgressBar(file=sys.stdout, unit="fingerprints"))
