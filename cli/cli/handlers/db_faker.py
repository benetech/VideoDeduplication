import random
from itertools import combinations, product
from uuid import uuid4 as uuid

from db import Database
from db.schema import Files, Exif, VideoMetadata, Scene, Matches, Signature


def _random_order(a, b):
    if random.random() > 0.5:
        return a, b
    return b, a


class DBFakerCli:
    """Generate fake database entries."""

    def __init__(self, config):
        self._config = config

    def cluster(self, count=10, min_distance=0.3, max_distance=0.7, density=0.2):
        """Generate fake file cluster."""
        database = Database.from_uri(uri=self._config.database.uri)
        with database.session_scope() as session:
            files = self._make_files(count)
            session.add_all(self._cluster(files, min_distance=min_distance, max_distance=max_distance, density=density))

    def files(self, count=10, prefix="", length=42, ext="mp4"):
        """Generate fake files."""
        database = Database.from_uri(uri=self._config.database.uri)
        with database.session_scope() as session:
            files = self._make_files(count=count, prefix=prefix, length=length, ext=ext)
            session.add_all(files)

    @staticmethod
    def _make_file(prefix="", length=42, ext="flv", scenes=((0, 1), (1, 2))):
        """Create unique file."""
        path = f"{prefix}some/path/{uuid()}.{ext}"
        sha256 = f"hash-of-{path}"
        return Files(
            file_path=path,
            sha256=sha256,
            exif=Exif(General_FileExtension=ext, General_Duration=length),
            meta=VideoMetadata(),
            scenes=[Scene(start_time=start, duration=duration) for start, duration in scenes],
            signature=Signature(signature=b"some-signature"),
        )

    @staticmethod
    def _make_files(count, prefix="", length=42, ext="flv", scenes=((0, 1), (1, 2))):
        """Create a collection of unique files."""
        return [DBFakerCli._make_file(prefix=prefix, length=length, ext=ext, scenes=scenes) for _ in range(count)]

    @staticmethod
    def _link(source, target, distance=0.5):
        """Create a match between files."""
        return Matches(query_video_file=source, match_video_file=target, distance=distance)

    @staticmethod
    def _cluster(files, min_distance=0.0, max_distance=0.7, density=1.0):
        links = []
        for a, b in combinations(files, 2):
            if random.random() > density:
                continue
            source, target = _random_order(a, b)
            distance = random.uniform(min_distance, max_distance)
            links.append(DBFakerCli._link(source, target, distance))
        return links

    @staticmethod
    def _connect(part1, part2, min_distance=0.0, max_distance=0.7, density=1.0):
        links = []
        for a, b in product(part1, part2):
            if random.random() > density:
                continue
            source, target = _random_order(a, b)
            distance = random.uniform(min_distance, max_distance)
            links.append(DBFakerCli._link(source, target, distance))
        return links
