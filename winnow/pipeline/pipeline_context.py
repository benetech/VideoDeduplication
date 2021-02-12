from typing import Callable

from cached_property import cached_property

from db import Database
from winnow.config import Config
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.repr_storage import ReprStorage
from winnow.utils.repr import reprkey_resolver


class PipelineContext:
    """Reusable components and resources that should be shared between pipeline stages."""

    def __init__(self, config: Config):
        """Create pipeline context."""
        self._config = config

    @cached_property
    def config(self) -> Config:
        """Get pipeline config."""
        return self._config

    @cached_property
    def repr_storage(self) -> ReprStorage:
        """Get representation storage."""
        return ReprStorage(directory=self.config.repr.directory)

    @cached_property
    def database(self) -> Database:
        """Get result database."""
        database = Database(uri=self.config.database.uri)
        database.create_tables()
        return database

    @cached_property
    def reprkey(self) -> Callable:
        """Get representation key getter."""
        return reprkey_resolver(self.config)

    @cached_property
    def result_storage(self) -> DBResultStorage:
        """Get database result storage."""
        return DBResultStorage(database=self.database)
