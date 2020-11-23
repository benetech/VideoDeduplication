import os
import tempfile
from dataclasses import dataclass
from uuid import uuid4 as uuid

import pytest

from thumbnail.cache import ThumbnailCache


@pytest.fixture
def cache():
    """
    Create a new empty thumbnail cache.
    """
    with tempfile.TemporaryDirectory(prefix="thumbnail-cache-") as directory:
        yield ThumbnailCache(directory=directory, capacity=10)


@pytest.fixture
def file():
    """Create a temporary file."""
    file = make_file("some-content")
    yield file
    os.remove(file)


def make_file(content):
    """Create a temporary file with the given content."""
    fd, path = tempfile.mkstemp()
    os.write(fd, content.encode("utf-8"))
    os.close(fd)
    return path


def read_file(path):
    """Read entire file content as string."""
    with open(path) as file:
        return file.read()


def test_missing(cache):
    assert cache.get("missing-path", "some-hash", position=0) is None
    assert not cache.exists("missing-path", "some-hash", position=0)

    existing_path, existing_hash, existing_pos = "some-path", "some-hash", 42
    cache.move(existing_path, existing_hash, existing_pos, make_file("some-content"))

    assert cache.get("missing-path", existing_hash, existing_pos) is None
    assert cache.get(existing_path, existing_hash, existing_pos + 1) is None
    assert not cache.exists("missing-path", existing_hash, existing_pos)
    assert not cache.exists(existing_path, existing_hash, existing_pos + 1)


def test_put(cache, file):
    existing_path, existing_hash, existing_pos = "some-path", "some-hash", 42

    cache.put(existing_path, existing_hash, existing_pos, file)
    assert cache.exists(existing_path, existing_hash, existing_pos)
    assert read_file(cache.get(existing_path, existing_hash, existing_pos)) == read_file(file)
    assert os.path.isfile(file)


def test_move(cache):
    existing_path, existing_hash, existing_pos = "some-path", "some-hash", 42
    expected_content = "some-content"
    file = make_file(expected_content)

    cache.move(existing_path, existing_hash, existing_pos, file)
    assert cache.exists(existing_path, existing_hash, existing_pos)
    assert read_file(cache.get(existing_path, existing_hash, existing_pos)) == expected_content
    assert not os.path.exists(file)


@dataclass
class Example:
    """Example cache entry."""

    path: str
    hash: str
    position: int
    file: str
    content: str

    def write(self, cache):
        """Write example file to cache."""
        cache.move(self.path, self.hash, self.position, self.file)

    def cache_key(self):
        """Get cache key of the given example."""
        return self.path, self.hash, self.position

    @staticmethod
    def make_unique():
        """Create a example setup."""
        unique_path = str(uuid())
        content = f"content-of-{unique_path}"
        return Example(
            path=unique_path, hash=f"hash-of-{unique_path}", position=0, file=make_file(content), content=content
        )


def test_eviction(cache):
    original = [Example.make_unique() for i in range(cache.capacity)]

    # Write maximal number of entries
    for example in original:
        example.write(cache)

    # Check all entries are cached
    for example in original:
        assert read_file(cache.get(*example.cache_key())) == example.content

    # Evict half of the original files
    extra = [Example.make_unique() for i in range(int(len(original) / 2))]
    for extra_example in extra:
        extra_example.write(cache)

    # Check first half of the original files is evicted
    for evicted in original[: len(extra)]:
        assert not cache.exists(*evicted.cache_key())
        assert cache.get(*evicted.cache_key()) is None

    # Check the second half of the original files is still cached
    for remaining in original[len(extra) :]:
        assert read_file(cache.get(*remaining.cache_key())) == remaining.content

    # Check extra example are cached
    for extra_example in extra:
        assert read_file(cache.get(*extra_example.cache_key())) == extra_example.content
