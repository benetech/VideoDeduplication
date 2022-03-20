import logging
import os
from datetime import datetime
from typing import Iterator, Collection, Union, Optional

from winnow.collection.file_collection import FileCollection
from winnow.storage.file_key import FileKey
from winnow.utils.files import extension_filter, iter_files, mtime_filter, FileHashFunc


class LocalFileCollection(FileCollection):
    """A collection of user media-files stored in some directory on
    a local file system.
    """

    logger = logging.getLogger(f"{__name__}.LocalFileCollection")

    def __init__(self, root_path: str, extensions: Collection[str], calculate_hash: FileHashFunc):
        self._root_path: str = root_path
        if not os.path.isdir(root_path):
            raise ValueError(f"Not a directory: {root_path}")
        self._extensions = tuple(extensions)
        self._extensions_filter = extension_filter(self._extensions)
        self._calculate_hash = calculate_hash

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
        for local_fs_path in self._iter_local_paths(prefix, min_mtime, max_mtime):
            yield FileKey(
                path=self._collection_path(local_fs_path),
                hash=self._calculate_hash(local_fs_path),
            )

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
        for local_path in self._iter_local_paths(prefix, min_mtime, max_mtime):
            yield self._collection_path(local_path)

    def local_fs_path(self, key_or_path: Union[FileKey, str], raise_exception=True) -> Optional[str]:
        """Convert path inside collection to the path on local file system.

        If ``raise_exception`` is False, None will be returned on missing key or path.
        Otherwise, KeyError will be raised.
        """
        collection_path = self._key_path(key_or_path)
        local_path = self._local_fs_path(collection_path)
        if not self._correct_local_path(local_path):
            if raise_exception:
                raise KeyError(f"Collection path doesn't exist: {collection_path}")
            return None
        return local_path

    def file_key(self, collection_path: str, raise_exception=True) -> Optional[FileKey]:
        """Convert path inside collection into FileKey.

        If ``raise_exception`` is False, None will be returned on missing path.
        Otherwise, KeyError will be raised.
        """
        local_fs_path = self._local_fs_path(collection_path)
        if not self._correct_local_path(local_fs_path):
            if raise_exception:
                raise KeyError(f"Collection path doesn't exist: {collection_path}")
            return None
        file_hash = self._calculate_hash(local_fs_path)
        return FileKey(collection_path, file_hash)

    def exists(self, key_or_path: Union[FileKey, str]) -> bool:
        """Check if the key or path exists inside the collection. """
        local_path = self._local_fs_path(self._key_path(key_or_path))
        return self._correct_local_path(local_path)

    def max_mtime(self, *, prefix: str = ".") -> datetime:
        """Get maximal last modified time among the files satisfying the criteria.

        If ``prefix`` is specified only paths starting with the given prefix
        will be selected.
        """
        file_paths = self._iter_local_paths(prefix)
        max_timestamp = max(map(os.path.getmtime, file_paths))
        return datetime.fromtimestamp(max_timestamp)

    def _iter_local_paths(
        self,
        prefix: str = ".",
        min_mtime: datetime = None,
        max_mtime: datetime = None,
    ) -> Iterator[str]:
        """Iterate over local paths of files in the collection."""
        parent_path = self._local_fs_path(prefix)
        paths = filter(self._extensions_filter, iter_files(parent_path))
        if min_mtime is not None or max_mtime is not None:
            correct_mtime = mtime_filter(min_mtime=min_mtime, max_mtime=max_mtime)
            paths = filter(correct_mtime, paths)
        return paths

    def _local_fs_path(self, path: str) -> str:
        """Get local path from the collection path."""
        return os.path.join(self._root_path, path)

    def _collection_path(self, local_path: str) -> str:
        """Convert local file-system path to storage path."""
        return os.path.relpath(local_path, start=self._root_path)

    def _correct_local_path(self, local_fs_path: str) -> bool:
        """Check if the local path corresponds to the existing media file."""
        return os.path.isfile(local_fs_path) and self._extensions_filter(local_fs_path)

    @staticmethod
    def _key_path(key_or_path: Union[FileKey, str]) -> str:
        """Get coll path from key or coll path."""
        if isinstance(key_or_path, FileKey):
            return key_or_path.path
        return key_or_path
