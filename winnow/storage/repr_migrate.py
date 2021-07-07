import logging
import os

from winnow.config import Config
from winnow.storage.legacy.lmdb_repr_storage import LMDBReprStorage
from winnow.storage.legacy.path_repr_storage import PathReprStorage
from winnow.storage.legacy.repr_key import ReprKey
from winnow.utils.repr import get_config_tag

logger = logging.getLogger(__name__)


class PathToLMDBMigration:
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
        logger.info("Migrating to lmdb storage:\n\tsrc=%s\n\tdst=%s", source, destination)
        config_tag = get_config_tag(self._config)
        path_storage = PathReprStorage(directory=source)
        lmdb_storage = LMDBReprStorage(directory=destination)
        try:
            for path, sha256 in path_storage.list():
                repr_value = path_storage.read(path, sha256)
                lmdb_storage.write(key=ReprKey(path=path, hash=sha256, tag=config_tag), value=repr_value)
                if clean_source:
                    path_storage.delete(path, sha256)
        finally:
            lmdb_storage.close()

    def migrate_all(self, source_root, destination_root, clean_source=False, representations=KNOWN_REPRESENTATIONS):
        """Migrate entire representations directory inplace, cleaning up the old representations."""
        source_root = self._normalize(source_root)
        destination_root = self._normalize(destination_root)
        for repr_name in representations:
            source_repr_path = os.path.join(source_root, repr_name)
            destination_repr_path = os.path.join(destination_root, repr_name)
            if os.path.isdir(source_repr_path):
                self.migrate_single_storage(
                    source=source_repr_path,
                    destination=destination_repr_path,
                    clean_source=clean_source,
                )

    def migrate_all_inplace(self, root_directory=None, clean_source=False, representations=KNOWN_REPRESENTATIONS):
        """Migrate representation storage inplace."""
        root_directory = root_directory or self._config.repr.directory
        self.migrate_all(
            source_root=root_directory,
            destination_root=root_directory,
            clean_source=clean_source,
            representations=representations,
        )

    def _storage_paths(self, root_directory, representations):
        """List different representation storage paths."""
        for repr_name in representations:
            repr_path = os.path.join(root_directory, repr_name)
            if os.path.isdir(repr_path):
                yield repr_path

    def _normalize(self, path):
        """Convert to absolute normalized path."""
        return os.path.normpath(os.path.abspath(path))
