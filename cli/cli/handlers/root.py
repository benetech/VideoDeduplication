from winnow.config import Config
from winnow.config.path import resolve_config_path
from .database import DatabaseCli
from .db_getter import DBGetterCli
from .pipeline import PipelineCli
from .repo import RepoCli


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
