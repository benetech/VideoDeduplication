from cli.platform.color import ok
from cli.platform.validate import boolean
from winnow.storage.repr_migrate import PathToLMDBMigration
from winnow.utils.logging import configure_logging_cli


class MigrationCli:
    """Manage migration from legacy storage versions."""

    def __init__(self, config):
        self._config = config

    def reprs(self, clean: bool = False):
        """Migrate representations storage from legacy path-storage to lmdb-storage."""
        configure_logging_cli()
        clean = boolean("clean", clean)
        path_to_lmdb = PathToLMDBMigration(config=self._config)
        path_to_lmdb.migrate_all_inplace(clean_source=clean)
        print(ok("OK"))
