import logging
import os

from winnow.config import Config
from winnow.storage.lmdb_repr_storage import LMDBReprStorage
from winnow.storage.path_repr_storage import PathReprStorage
from winnow.storage.repr_key import ReprKey
from winnow.utils.repr import get_config_tag

logger = logging.getLogger(__name__)


class PathToLMDB:
    """PathToLMDB carries out migration of PathReprStorage to LMDBReprStorage."""

    # Known representation types
    KNOWN_REPRESENTATIONS = (
        "frames",
        "frame_level",
        "video_level",
        "video_signatures",
    )

    def __init__(self, config: Config):
        self._config: Config = config

    def migrate_single_storage(self, source, destination, clean_source=False):
        """Migrate single PathReprStorage to LMDBReprStorage."""
        logger.info("Migrating path to lmdb storage: source=%s, destination=%s", source, destination)
        config_tag = get_config_tag(self._config)
        path_storage = PathReprStorage(directory=source)
        lmdb_storage = LMDBReprStorage(directory=destination)
        for path, sha256 in path_storage.list():
            repr_value = path_storage.read(path, sha256)
            lmdb_storage.write(key=ReprKey(path=path, hash=sha256, tag=config_tag), value=repr_value)
            if clean_source:
                path_storage.delete(path, sha256)

    def migrate_all(self, root_directory=None, representations=KNOWN_REPRESENTATIONS):
        """Migrate entire representations directory inplace, cleaning up the old representations."""
        root_directory = self._normalize(root_directory or self._config.repr.directory)
        for repr_path in self._storage_paths(root_directory, representations):
            self.migrate_single_storage(source=repr_path, destination=repr_path, clean_source=True)

    def _storage_paths(self, root_directory, representations):
        """List different representation storage paths."""
        for repr_name in representations:
            repr_path = os.path.join(root_directory, repr_name)
            if os.path.isdir(repr_path):
                yield repr_path

    def _normalize(self, path):
        """Convert to absolute normalized path."""
        return os.path.normpath(os.path.abspath(path))
