import abc
import logging
import os
from pathlib import Path
from shutil import copyfile
from typing import Iterator, Union, Optional, TextIO, BinaryIO
from urllib.parse import urlunparse
from uuid import uuid4 as uuid

_logger = logging.getLogger(__name__)


class FileStorage(abc.ABC):
    """FileStorage defines common API to save and retrieve application-related
    files (assets, template images, etc.) to/from some persistent storage.
    """

    @abc.abstractmethod
    def save_file(self, file_path: str) -> str:
        """Save file to storage and get storage key for the saved file."""

    @abc.abstractmethod
    def keys(self) -> Iterator[str]:
        """Iterate over file keys."""

    @abc.abstractmethod
    def exists(self, key: str) -> bool:
        """Check if the storage contains entry with the given key."""

    @abc.abstractmethod
    def delete(self, key: str) -> bool:
        """Delete file by storage key.

        Returns:
            True iff the key was found and deleted.
        """

    @abc.abstractmethod
    def get_file(self, key: str, destination_path: str) -> bool:
        """Save file to the destination path.

        Returns:
            True iff storage contains the file with the given key.
        """

    @abc.abstractmethod
    def get_file_uri(self, key: str) -> Optional[str]:
        """Get a URI by which the file could be accessed by the client code."""

    @abc.abstractmethod
    def open_file(self, key: str, binary: bool = False) -> Optional[Union[TextIO, BinaryIO]]:
        """Open store entry as a file object."""


class LocalFileStorage(FileStorage):
    """Local file-system file storage."""

    def __init__(self, directory: str):
        self._directory = os.path.abspath(os.path.normpath(directory))
        if not os.path.exists(self._directory):
            _logger.info("Creating local file storage directory: %s", self._directory)
            os.makedirs(self._directory)
        if not os.path.isdir(self._directory):
            raise ValueError(f"Not a directory: {directory}")

    def save_file(self, file_path: str) -> str:
        """Save file to storage and get storage key for the saved file."""
        key = str(uuid())
        destination_path = self._key_to_path(key)
        copyfile(file_path, destination_path)
        return key

    def keys(self) -> Iterator[str]:
        """Iterate over file keys."""
        for entry in os.listdir(self._directory):
            if os.path.isfile(os.path.join(self._directory, entry)):
                yield entry

    def exists(self, key: str) -> bool:
        """Check if the storage contains entry with the given key."""
        path = self._key_to_path(key)
        return os.path.isfile(path) and Path(self._directory) in Path(path).parents

    def delete(self, key: str) -> bool:
        """Delete file by storage key.

        Returns:
            True iff the key was found and deleted.
        """
        if not self.exists(key):
            return False
        local_path = self._key_to_path(key)
        os.remove(local_path)
        return True

    def get_file(self, key: str, destination_path: str) -> bool:
        """Save file to the destination path.

        Returns:
            True iff storage contains the file with the given key.
        """
        if not self.exists(key):
            return False
        if not os.path.exists(os.path.dirname(destination_path)):
            os.makedirs(os.path.dirname(destination_path))
        source_path = self._key_to_path(key)
        copyfile(source_path, destination_path)
        return True

    def get_file_uri(self, key: str) -> Optional[str]:
        """Get a URI by which the file could be accessed by the client code."""
        if not self.exists(key):
            return None
        local_path = self._key_to_path(key)
        return urlunparse(("file", None, local_path, None, None, None))

    def open_file(self, key: str, binary: bool = False) -> Optional[Union[TextIO, BinaryIO]]:
        """Open store entry as a file object."""
        mode = "rb" if binary else "r"
        if not self.exists(key):
            return None
        path = self._key_to_path(key)
        return open(path, mode)

    def _key_to_path(self, key: str) -> str:
        """Convert file key to local file path."""
        return os.path.abspath(os.path.normpath(os.path.join(self._directory, key)))


class S3FileStorage(FileStorage):
    """S3-based file storage."""

    def __init__(self, s3_client, bucket: str, prefix: str = ""):
        """Create new instance.

        Args:
            s3_client: boto3 s3 client.
            bucket (str): bucket name.
            prefix (str): common prefix for files.
        """
        raise NotImplementedError()

    def save_file(self, file_path: str) -> str:
        """Save file to storage and get storage key for the saved file."""
        raise NotImplementedError()

    def keys(self) -> Iterator[str]:
        """Iterate over file keys."""
        raise NotImplementedError()

    def exists(self, key: str) -> bool:
        """Check if the storage contains entry with the given key."""
        raise NotImplementedError()

    def delete(self, key: str) -> bool:
        """Delete file by storage key.

        Returns:
            True iff the key was found and deleted.
        """
        raise NotImplementedError()

    def get_file(self, key: str, destination_path: str) -> bool:
        """Save file to the destination path.

        Returns:
            True iff storage contains the file with the given key.
        """
        raise NotImplementedError()

    def get_file_uri(self, key: str) -> Optional[str]:
        """Get a URI by which the file could be accessed by the client code."""
        raise NotImplementedError()

    def open_file(self, key: str, binary: bool = False) -> Optional[Union[TextIO, BinaryIO]]:
        """Open store entry as a file object."""
        raise NotImplementedError()
