import abc
from datetime import datetime
from os import PathLike
from typing import Iterator, Union, Optional

from winnow.storage.file_key import FileKey


class FileCollection(abc.ABC):
    """The ``FileCollection`` is an abstraction to work with user files.
    This class represents a collection of media files (videos) managed
    by the application and on which the application performs its analysis.

    FileCollection posses the following properties:
     * Each file has its "path" inside the collection which must be a
       valid unix path
     * The root path is "."
     * The collection may provide a local file system path of its entries.
       In case of remote collection this may result in downloading a file
       to a temporary location behind the scenes.
    """

    @abc.abstractmethod
    def iter_keys(
        self,
        *,
        prefix: str = ".",
        min_mtime: datetime = None,
        max_mtime: datetime = None,
    ) -> Iterator[FileKey]:
        """Iterate over all the file keys inside the collection satisfying
        the given filtering criteria.

        If ``prefix`` is specified only paths starting with the given prefix
        will be selected. If ``min_mtime`` or ``max_mtime`` are specified
        the keys will be filtered by the last modified time.
        """

    @abc.abstractmethod
    def iter_paths(
        self,
        *,
        prefix: str = ".",
        min_mtime: datetime = None,
        max_mtime: datetime = None,
    ) -> Iterator[str]:
        """Iterate over all the paths inside the collection satisfying
        the given filtering criteria.

        If ``prefix`` is specified only paths starting with the given prefix
        will be selected. If ``min_mtime`` or ``max_mtime`` are specified
        the paths will be filtered by the last modified time.
        """

    @abc.abstractmethod
    def file_key(self, collection_path: str, raise_exception=True) -> Optional[FileKey]:
        """Convert path inside collection into ``FileKey``.

        If ``raise_exception`` is False, None will be returned on missing path.
        Otherwise, KeyError will be raised.
        """

    @abc.abstractmethod
    def exists(self, key_or_path: Union[FileKey, str]) -> bool:
        """Check if the key or path exists inside the collection."""

    @abc.abstractmethod
    def local_fs_path(self, key_or_path: Union[FileKey, str], raise_exception=True) -> Optional[str]:
        """Convert path inside collection to the path on local file system.

        If ``raise_exception`` is ``False``, None will be returned on missing key or path.
        Otherwise, ``KeyError`` will be raised.
        """

    @abc.abstractmethod
    def max_mtime(self, *, prefix: str = ".") -> datetime:
        """Get maximal last modified time among the files satisfying the criteria.

        If ``prefix`` is specified only paths starting with the given prefix
        will be selected.
        """

    def any(self, *, prefix: str = ".", min_mtime: datetime = None, max_mtime: datetime = None):
        """Convenience method to check if any file-collection entry satisfies the given parameters."""
        return any(self.iter_paths(prefix=prefix, min_mtime=min_mtime, max_mtime=max_mtime))

    @abc.abstractmethod
    def store(self, local_fs_path: str, coll_path: str, exist_ok: bool = False) -> FileKey:
        """Store file from the filesystem to the collection by the given collection path."""


class MediaFile(PathLike):
    """This is draft for the abstract media file associated with some FileCollection."""

    @abc.abstractmethod
    def path(self) -> str:
        """Path inside collection."""

    @abc.abstractmethod
    def etag(self) -> str:
        """Entity tag, an opaque string which guaranteed to
        change if file contents have changed.
        """

    @abc.abstractmethod
    def local_path(self) -> str:
        """Path on the local file system."""

    @abc.abstractmethod
    def last_modified(self) -> float:
        """Get last modified timestamp."""
