import json
import logging
import os
from glob import glob
from os.path import join, relpath, abspath, exists, dirname

import lmdb
import numpy as np
from dataclasses import dataclass, asdict

from winnow.storage.repr_key import ReprKey

# Logger used in representation-storage module
logger = logging.getLogger(__name__)
output_file_handler = logging.FileHandler("processing_error.log")
logger.addHandler(output_file_handler)

# String encoding used in tag storage
_METADATA_ENCODING = "utf-8"


@dataclass
class Metadata:
    """Storage entry metadata."""

    hash: str  # data file hash
    tag: str  # pipeline configuration tag

    def dump(self):
        """Convert metadata to bytes."""
        return json.dumps(asdict(self)).encode(_METADATA_ENCODING)

    @staticmethod
    def load(data: bytes):
        """Load metadata from bytes."""
        return Metadata(**json.loads(data.decode(_METADATA_ENCODING)))

    @staticmethod
    def from_key(key: ReprKey):
        """Read metadata from representation storage key."""
        return Metadata(hash=key.hash, tag=key.tag)


class LMDBReprStorage:
    """LMDB-based persistent storage for intermediate representations.

    For each dataset file path there is a single entry in the storage.
    Each entry is associated with the file hash and configuration tag.

    The purpose of the file hash is to guarantee that whenever original
    file content changes the client must be able to detect that to update
    the stored representation value.

    Configuration tag purpose is to guarantee that whenever pipeline
    configuration is changed the clint code must be able to detect that
    to update the stored representation value.

    It is responsibility of client code to make sure that incompatible
    pipeline configurations have different key tags.
    """

    def __init__(self, directory, save=np.save, load=np.load, suffix=".npy"):
        """Create a new LMDBReprStorage instance.

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
        if not exists(self.directory):
            logger.info("Creating intermediate representations directory: %s", self.directory)
            os.makedirs(self.directory)
        self._metadata_storage = lmdb.open(join(self.directory, "store.lmdb"))

    def exists(self, key: ReprKey):
        """Check if the representation exists."""
        try:
            with self._metadata_storage.begin(write=False) as txn:
                metadata = self._read_metadata(key.path, txn)
                return exists(self._map(key.path)) and metadata == Metadata.from_key(key)
        except Exception as e:

            logger.error(f"Error processing file:{key.path}")
            logger.error(e)
            return False

    def read(self, key: ReprKey):
        """Read file's representation."""
        if not self.exists(key):
            raise KeyError(repr(key))
        return self._load(self._map(key.path))

    def write(self, key: ReprKey, value):
        """Write the representation for the given file."""
        with self._metadata_storage.begin(write=True) as txn:
            feature_file_path = self._map(key.path)
            if not exists(dirname(feature_file_path)):
                os.makedirs(dirname(feature_file_path))
            self._save(feature_file_path, value)
            self._write_metadata(key, txn)

    def delete(self, path):
        """Delete representation for the file."""
        with self._metadata_storage.begin(write=True) as txn:
            os.remove(self._map(path))
            self._delete_metadata(path, txn)

    def list(self):
        """Iterate over all storage keys."""
        path_pattern = join(self.directory, f"**/*{self.suffix}")
        with self._metadata_storage.begin(write=False) as txn:
            for repr_file_path in glob(path_pattern, recursive=True):
                original_path = self._reverse(repr_file_path)
                metadata = self._read_metadata(original_path, txn)
                yield ReprKey(path=original_path, hash=metadata.hash, tag=metadata.tag)

    # Private methods

    def _map(self, path):
        """Get corresponding file."""
        return join(self.directory, f"{path}{self.suffix}")

    def _reverse(self, mapped_path):
        """Restore original path from mapped file path."""
        relative_path = relpath(abspath(mapped_path), self.directory)
        if not relative_path.endswith(self.suffix):
            raise ValueError(f"Not a reversible path: {mapped_path}")
        return relative_path[: -len(self.suffix)]

    @staticmethod
    def _read_metadata(path, txn):
        """Read metadata for the given video-file."""
        metadata_key = path.encode(_METADATA_ENCODING)
        serialized_metadata = txn.get(metadata_key)
        if serialized_metadata is None:
            return None
        return Metadata.load(serialized_metadata)

    @staticmethod
    def _write_metadata(key: ReprKey, txn):
        """Write metadata for the given video-file."""
        metadata_key = key.path.encode(_METADATA_ENCODING)
        metadata = Metadata.from_key(key)
        txn.put(metadata_key, metadata.dump())

    @staticmethod
    def _delete_metadata(path, txn):
        """Delete metadata for the given video-file."""
        key = path.encode(_METADATA_ENCODING)
        txn.delete(key)
