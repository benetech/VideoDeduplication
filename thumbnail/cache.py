import logging
import os
import shutil
from datetime import datetime
from uuid import uuid4 as uuid

from sqlalchemy import Column, String, Integer, UniqueConstraint, DateTime
from sqlalchemy.ext.declarative import declarative_base

from db import Database

# Logger used in thumbnail cache module
logger = logging.getLogger(__name__)

# Base-class for database entities
Base = declarative_base()


class CacheEntry(Base):
    """Single cache entry."""

    __tablename__ = "entry"
    __table_args__ = (UniqueConstraint("source_path", "source_sha256", "position", name="_file_uc"),)
    id = Column(Integer, primary_key=True)
    source_path = Column(String)  # Source video-file path
    source_sha256 = Column(String)  # Source video-file hash
    position = Column(Integer)  # Position inside source video-file
    thumbnail = Column(String)  # Path to the thumbnail relative to the root directory
    last_access = Column(DateTime, default=datetime.utcnow)  # Last access time


class ThumbnailCache:
    """Local LRU cache of thumbnail images."""

    def __init__(self, directory, capacity=1000, suffix=".jpg"):
        """Create thumbnail cache instance.

        Args:
            directory (str): local directory in which thumbnails will be stored.
            capacity (int): maximal thumbnail count to be stored in the cache.
            suffix (str): A string to be appended to the cached file names.
        """
        self.directory = os.path.abspath(directory)
        if not os.path.exists(directory):
            logger.info("Creating thumbnail cache directory: %s", self.directory)
            os.makedirs(self.directory)

        self.capacity = capacity
        self.suffix = suffix
        self.db_file = os.path.join(self.directory, "cache.sqlite")
        self.database = Database.from_uri(f"sqlite:///{self.db_file}", base=Base)
        self.database.create_tables()

    def put(self, path, sha256, position, thumbnail):
        """Put thumbnail into the cache.

        If cache entry is already exists it will be overwritten.
        The thumbnail file will be copied to the cache. It is
        responsibility of a client to delete source thumbnail
        file if needed.

        NOTE: the client should never delete returned thumbnail
        file path, as this will make cache inconsistent. The
        ThumbnailCache.delete() method should be used instead.

        Args:
            path (str): Source video file path inside video files folder.
            sha256 (str): SHA256 digest of the source video file.
            position (int): Time position inside the video file for which thumbnail is generated.
            thumbnail (str): Path to the thumbnail file to be cached.

        Returns:
            Path to the cached thumbnail file.
        """
        return self._write(path, sha256, position, thumbnail, write_file=shutil.copyfile)

    def move(self, path, sha256, position, thumbnail):
        """Move thumbnail file into the cache.

        If cache entry is already exists it will be overwritten.
        The thumbnail file will be moved to the cache folder.

        NOTE: the client should never delete returned thumbnail
        file path, as this will make cache inconsistent. The
        ThumbnailCache.delete() method should be used instead.

        Args:
            path (str): Source video file path inside video files folder.
            sha256 (str): SHA256 digest of the source video file.
            position (int): Time position inside the video file for which thumbnail is generated.
            thumbnail (str): Path to the thumbnail file to be cached.

        Returns:
            Path to the cached thumbnail file.
        """
        return self._write(path, sha256, position, thumbnail, write_file=shutil.move)

    def exists(self, path, sha256, position):
        """Check if thumbnail is present in cache.

        Args:
            path (str): Source video file path inside video files folder.
            sha256 (str): SHA256 digest of the source video file.
            position (int): Time position inside the video file for which thumbnail is generated.

        Returns:
            True iff thumbnail for the given file position is present in the cache.
        """
        with self.database.session_scope() as session:
            return self._record_exists(session, path, sha256, position)

    def get(self, path, sha256, position):
        """Get thumbnail for the given file position.

        NOTE: the client should never delete returned thumbnail
        file path, as this will make cache inconsistent. The
        ThumbnailCache.delete() method should be used instead.

        Args:
            path (str): Source video file path inside video files folder.
            sha256 (str): SHA256 digest of the source video file.
            position (int): Time position inside the video file for which thumbnail is generated.

        Returns:
            Path to the cached thumbnail file or None if cache entry doesn't exist.
        """
        with self.database.session_scope() as session:
            record = self._record(session, path, sha256, position).one_or_none()
            if record is None:
                return None
            record.last_access = datetime.utcnow()
            return os.path.join(self.directory, record.thumbnail)

    def delete(self, path, sha256, position):
        """Delete thumbnail from the cache.

        Args:
            path (str): Source video file path inside video files folder.
            sha256 (str): SHA256 digest of the source video file.
            position (int): Time position inside the video file for which thumbnail is generated.

        Returns:
            True iff the thumbnail was found in and evicted from the cache.
        """
        with self.database.session_scope() as session:
            entry = self._record(session, path, sha256, position).first()
            if entry is not None:
                self._evict(session, entry)
                return True
            return False

    def _write(self, path, sha256, position, thumbnail, write_file):
        """Write cache entry value."""
        with self.database.session_scope() as session:
            entry = self._get_or_create(session, path, sha256, position, suffix=self.suffix)
            entry.last_access = datetime.utcnow()
            entry_path = os.path.join(self.directory, entry.thumbnail)
            write_file(thumbnail, entry_path)
            self._evict_entries(session)
            return entry_path

    def _evict_entries(self, session):
        """Evict entries if needed."""
        entry_count = session.query(CacheEntry).count()
        if entry_count > self.capacity:
            logger.info("Cache capacity is exceeded! Evicting %d extra file(s)", entry_count - self.capacity)
            for entry in session.query(CacheEntry).order_by(CacheEntry.last_access.desc()).offset(self.capacity).all():
                self._evict(session, entry)

    def _evict(self, session, entry):
        """Evict single cache entry."""
        os.remove(os.path.join(self.directory, entry.thumbnail))
        session.delete(entry)

    @staticmethod
    def _record_exists(session, path, sha256, position):
        """Check if database record for the given cache entry exists."""
        return (
            session.query(CacheEntry.id)
            .filter(
                CacheEntry.source_path == path,
                CacheEntry.source_sha256 == sha256,
                CacheEntry.position == position,
            )
            .scalar()
            is not None
        )

    @staticmethod
    def _record(session, path, sha256, position):
        """Get database record query for the given cache entry."""
        return session.query(CacheEntry).filter(
            CacheEntry.source_path == path,
            CacheEntry.source_sha256 == sha256,
            CacheEntry.position == position,
        )

    @staticmethod
    def _get_or_create(session, path, sha256, position, suffix=""):
        """Get record if exists, or create a new one otherwise."""
        entry = ThumbnailCache._record(session, path, sha256, position).first()
        if entry is not None:
            return entry
        entry = CacheEntry(
            source_path=path,
            source_sha256=sha256,
            position=position,
            thumbnail=f"{uuid()}{suffix}",
        )
        session.add(entry)
        return entry
