import json
import logging
import os
from glob import glob
from os.path import join, relpath, abspath, exists, dirname

import lmdb
import numpy as np

# Logger used in representation-storage module
logger = logging.getLogger(__name__)

# String encoding used in tag storage
_TAG_ENCODING = "utf-8"


class PathReprStorage:
    """Metadata-less persistent storage of intermediate representations.

    For each source file (path,hash) there is no more than one
    intermediate representation file in the storage directory.
    Original path and hash are encoded in the representation file path.
    """

    def __init__(self, directory, save=np.save, load=np.load, suffix="_vgg_features.npy"):
        """Create a new ReprStorage instance.

        Args:
            directory (String): A root directory in which representations will be stored.
            save (Function): Function to write representation value to the file.
            load (Function): Function to load representation value from file.
            suffix (String): A common suffix of intermediate representation files.
        """
        self.directory = abspath(directory)
        self.suffix = suffix
        self._save = save
        self._load = load
        self._tag_store = lmdb.open(join(self.directory, "store.lmdb"))
        if not exists(self.directory):
            logger.info("Creating intermediate representations directory: %s", self.directory)
            os.makedirs(self.directory)

    def exists(self, path, tags=None):
        """Check if the file has the representation.

        If tags are None, the method will ignore any metadata tags
        associated with the representation (if any).

        If tags are not None, they will be compared to the metadata
        tags associated with the representation. The method will
        return True only if provided tags are equal to the stored ones.

        Args:
            path (str): Original video file path relative to dataset root folder.
            tags (dict): Any metadata associated with the representation
                (e.g. file hash, pipeline config attributes, etc.).
        """
        if tags is None:
            return exists(self._map(path))
        with self._tag_store.begin(write=False) as txn:
            actual_tags = self._read_tags(path, txn)
            return exists(self._map(path)) and tags == actual_tags

    def read(self, path, tags=None):
        """Read file's representation.

        If tags are None, the method will ignore any metadata tags
        associated with the representation (if any).

        If tags are not None, they will be checked against the metadata
        tags associated with the representation. The method will raise
        KeyError if provided tags are not equal to the stored ones.

        Args:
            path (str): Original video file path relative to dataset root folder.
            tags (dict): Any metadata associated with the representation
                (e.g. file hash, pipeline config attributes, etc.).
        """
        if not self.exists(path, tags):
            raise KeyError(f"{path} with tags={tags}")
        return self._load(self._map(path))

    def tags(self, path):
        """Read file's representation metadata tags.

        Args:
            path (str): Original video file path relative to dataset root folder.
        """
        with self._tag_store.begin(write=False) as txn:
            return self._read_tags(path, txn)

    def write(self, path, value, tags=None):
        """Write the representation for the given file.

        Args:
            path (str): Original video file path relative to dataset root folder.
            value: Intermediate representation value to be stored.
            tags (dict): Any metadata associated with the representation
                (e.g. file hash, pipeline config attributes, etc.).
        """
        with self._tag_store.begin(write=True) as txn:
            feature_file_path = self._map(path)
            if not exists(dirname(feature_file_path)):
                os.makedirs(dirname(feature_file_path))
            self._save(feature_file_path, value)
            self._write_tags(path, tags, txn)

    def delete(self, path):
        """Delete representation for the file."""
        with self._tag_store.begin(write=True) as txn:
            os.remove(self._map(path))
            self._delete_tags(path, txn)

    def list(self):
        """Iterate over all (path,tags) pairs that already have this representation."""
        path_pattern = join(self.directory, f"**/*{self.suffix}")
        with self._tag_store.begin(write=False) as txn:
            for repr_file_path in glob(path_pattern, recursive=True):
                store_path = self._reverse(repr_file_path)
                yield store_path, self._read_tags(store_path, txn)

    # Private methods

    def _map(self, path):
        """Get corresponding file."""
        return join(self.directory, f"{path}{self.suffix}")

    def _reverse(self, mapped_path):
        """Restore original path from mapped file path."""
        relative_path = relpath(abspath(mapped_path), self.directory)
        if not relative_path.endswith(self.suffix):
            raise ValueError(f"Not a reversible path: {mapped_path}")
        return relative_path[:-len(self.suffix)]

    @staticmethod
    def _read_tags(path, txn):
        """Read metadata tags for the given source video-file path."""
        key = path.encode(_TAG_ENCODING)
        serialized_tags = txn.get(key)
        if serialized_tags is None:
            return None
        return json.loads(serialized_tags.decode(_TAG_ENCODING))

    @staticmethod
    def _write_tags(path, tags, txn):
        """Write metadata tags for the given source video-file path."""
        key = path.encode(_TAG_ENCODING)
        serialized_tags = json.dumps(tags).encode(_TAG_ENCODING)
        txn.put(key, serialized_tags)

    @staticmethod
    def _delete_tags(path, txn):
        """Delete metadata tags for the given source video-file path."""
        key = path.encode(_TAG_ENCODING)
        txn.delete(key)
