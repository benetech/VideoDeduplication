import logging
import os

from cached_property import cached_property
from dataclasses import dataclass

from winnow.storage.metadata import DataLoader

# Default module logger
_logger = logging.getLogger(__name__)


class InvalidManifest(Exception):
    """Exception raised when manifest is invalid."""


class IncompatibleManifest(Exception):
    """Exception raised when incompatible manifest is enforced."""


@dataclass(frozen=True)
class StorageManifest:
    """
    Storage manifest allows to identify storage type.
    """

    type: str
    version: int

    def ensure_valid(self):
        """Validate manifest, raise InvalidManifest if not valid."""
        if not isinstance(self.type, str) or len(self.type) == 0:
            raise InvalidManifest(f"Invalid storage type: {self.type}")
        if not isinstance(self.version, int) or self.version < 0:
            raise InvalidManifest(f"Invalid storage version: {self.version}")


class StorageManifestFile:
    """Utility class to work with storage manifest files.

    StorageManifestFile assumes that representation storage occupies some directory and the corresponding manifest file
    is located at the root of that directory.
    """

    # Default file name for storage manifest
    DEFAULT_MANIFEST_FILENAME = ".storage.json"

    def __init__(self, storage_directory, filename=DEFAULT_MANIFEST_FILENAME):
        """Create manifest file."""
        self._storage_directory = storage_directory
        self._filename = filename

    @cached_property
    def path(self):
        """Get the manifest file path."""
        return os.path.join(self._storage_directory, self._filename)

    def exists(self):
        """Check if the manifest file exists."""
        return os.path.isfile(self.path)

    def read(self, default: StorageManifest = None) -> StorageManifest:
        """Read storage manifest."""
        if not self.exists():
            return default
        with open(self.path, "r") as file:
            return DataLoader(StorageManifest).load(file)

    def write(self, manifest: StorageManifest):
        """Write storage manifest to the file.

        The manifest must be valid, otherwise InvalidManifest is raised.
        """
        manifest.ensure_valid()
        with open(self.path, "w") as file:
            return DataLoader(StorageManifest).dump(manifest, file)

    def ensure(self, wanted: StorageManifest):
        """Ensure storage contains requested manifest.

        If storage contains incompatible manifest type, then IncompatibleManifest is raised.
        If storage contains manifest version higher than requested, then IncompatibleManifest is raised.
        if storage contains manifest version lower than requested, then manifest file is updated with a requested version.
        if storage doesn't have a manifest, then requested manifest is created.
        """
        if not self.exists():
            _logger.info(f"Writing a new storage manifset {wanted}, manifest path: {self.path}")
            self.write(wanted)
            return
        existing = self.read()
        if existing.type != wanted.type:
            raise IncompatibleManifest(
                f"Incompatible storage type: {existing.type}, expected type: {wanted.type}, manifest path: {self.path}"
            )
        if existing.version > wanted.version:
            raise IncompatibleManifest(
                f"Incompatible storage version: {existing.version}, "
                f"expected version: {wanted.version} or lower, manifest path: {self.path}. "
                f"Please use '{existing.type}' storage client version {existing.version} or higher."
            )
        if existing.version < wanted.version:
            _logger.info(
                f"Updating '{wanted.type}' storage from version {existing.version} "
                f"to {wanted.version}, manifest path: {self.path}"
            )
            self.write(wanted)
