import abc
import hashlib
import json
from typing import List, Tuple

import redis
from dataclasses import replace, dataclass, astuple, asdict

from db.access.files import Counts
from server.model import ListFilesApiRequest


def _hash(req: ListFilesApiRequest) -> str:
    """Hash api request."""
    sha1 = hashlib.sha1()
    attr_values = astuple(replace(req, offset=0, limit=0, include=()))
    for attr_value in attr_values:
        sha1.update(str(attr_value).encode("utf-8"))
    return sha1.hexdigest()


@dataclass
class FileQueryResults:
    """Cached value."""

    file_ids: List[int]
    counts: Counts


class FileQueryCache(abc.ABC):
    """File query cache base class."""

    @abc.abstractmethod
    def __contains__(self, item: ListFilesApiRequest) -> bool:
        """Check if cache contains request results."""

    @abc.abstractmethod
    def __getitem__(self, item: ListFilesApiRequest) -> FileQueryResults:
        """Get cached results."""

    @abc.abstractmethod
    def __setitem__(self, key: ListFilesApiRequest, value: FileQueryResults):
        """Cache query results."""

    @abc.abstractmethod
    def __delitem__(self, key: ListFilesApiRequest):
        """Delete cache entry."""

    @abc.abstractmethod
    def slice(self, req: ListFilesApiRequest) -> FileQueryResults:
        """Slice cached ids."""


class NoCache(FileQueryCache):
    """Disabled cache dummy."""

    def __contains__(self, item: ListFilesApiRequest) -> bool:
        return False

    def __getitem__(self, item: ListFilesApiRequest) -> FileQueryResults:
        raise KeyError()

    def __setitem__(self, key: ListFilesApiRequest, value: FileQueryResults):
        pass

    def __delitem__(self, key: ListFilesApiRequest):
        pass

    def slice(self, req: ListFilesApiRequest) -> FileQueryResults:
        raise KeyError()


class RedisCache(FileQueryCache):
    """Redis-based query cache implementation."""

    def __init__(self, client: redis.Redis):
        self.redis: redis.Redis = client

    def __contains__(self, item: ListFilesApiRequest) -> bool:
        """Check if cache contains request results."""
        redis_keys = self._redis_keys(item)
        return bool(self.redis.exists(*redis_keys))

    def __getitem__(self, item: ListFilesApiRequest) -> FileQueryResults:
        """Get cached results."""
        ids_key, counts_key = self._redis_keys(item)
        ids = list(map(int, self.redis.get(ids_key)))
        counts = self._get_counts(counts_key)
        return FileQueryResults(file_ids=ids, counts=counts)

    def __setitem__(self, key: ListFilesApiRequest, value: FileQueryResults):
        """Cache query results."""
        ids_key, counts_key = self._redis_keys(key)
        self.redis.delete(ids_key, counts_key)
        self._set_counts(counts_key, value.counts)
        self.redis.rpush(ids_key, *value.file_ids)

    def __delitem__(self, key: ListFilesApiRequest):
        """Delete cache entry."""
        redis_keys = self._redis_keys(key)
        self.redis.delete(*redis_keys)

    def slice(self, req: ListFilesApiRequest) -> FileQueryResults:
        """Slice cached ids."""
        ids_key, counts_key = self._redis_keys(req)
        if not self.redis.exists(ids_key, counts_key):
            raise KeyError()
        file_ids = list(map(int, self.redis.lrange(ids_key, req.offset, req.offset + req.limit)))
        counts = self._get_counts(counts_key)
        return FileQueryResults(file_ids=file_ids, counts=counts)

    def _redis_keys(self, req: ListFilesApiRequest) -> Tuple[str, str]:
        """Get redis keys for ids, relevance and counts.

        Returns: (ids_key, counts_key)
        """
        req_hash = _hash(req)[:10]
        return f"file-query-ids-{req_hash}", f"file-query-counts-{req_hash}"

    def _get_counts(self, redis_key: str) -> Counts:
        """Get counts from redis cache."""
        return Counts(**json.loads(self.redis.get(redis_key)))

    def _set_counts(self, redis_key: str, counts: Counts):
        """Store counts in redis cache."""
        serialized_counts = json.dumps(asdict(counts))
        self.redis.set(redis_key, serialized_counts)
