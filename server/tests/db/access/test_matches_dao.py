import itertools
from uuid import uuid4 as uuid

import pytest

from db import Database
from db.access.matches import MatchesDAO, FileMatchesRequest, FileMatchesResult
from db.schema import Files, Exif, VideoMetadata, Scene, Matches


def make_file(prefix="", length=42, ext="flv", scenes=((0, 1), (1, 2))):
    """Create unique file."""
    path = f"{prefix}some/path/{uuid()}.{ext}"
    sha256 = f"hash-of-{path}"
    return Files(file_path=path, sha256=sha256,
                 exif=Exif(General_FileExtension=ext, ),
                 meta=VideoMetadata(video_length=length),
                 scenes=[Scene(start_time=start, duration=duration) for start, duration in scenes])


def make_files(count, prefix="", length=42, ext="flv", scenes=((0, 1), (1, 2))):
    """Create a collection of unique files."""
    return [
        make_file(prefix=prefix, length=length, ext=ext, scenes=scenes) for _ in range(count)
    ]


def link(source, target, distance=0.5):
    """Create a match between files."""
    return Matches(query_video_file=source, match_video_file=target, distance=distance)


@pytest.fixture
def database():
    """Create test database."""
    in_memory_database = Database.in_memory(echo=False)
    in_memory_database.create_tables()
    return in_memory_database


def pop(queue, max_count):
    """Pop multiple items from queue."""
    result = []
    for _ in range(max_count):
        if len(queue) == 0:
            return result
        result.append(queue.pop())
    return result


def chunks(iterable, size=100):
    """Split iterable into equal-sized chunks."""
    iterator = iter(iterable)
    chunk = list(itertools.islice(iterator, size))
    while chunk:
        yield chunk
        chunk = list(itertools.islice(iterator, size))


def assert_file_set(resp: FileMatchesResult, expected):
    """Check result file set."""
    expected = {file.id for file in expected}
    actual = {file.id for file in resp.files}
    assert actual == expected


def test_list_file_matches_hops(database: Database):
    with database.session_scope(expunge=True) as session:
        # Create files
        source = make_file()
        path_a = make_files(4)
        path_b = make_files(4)
        session.add(source)
        session.add_all(path_a)
        session.add_all(path_b)

        # Link files
        a1, a2, a3, a4 = path_a
        b1, b2, b3, b4 = path_b
        session.add_all([
            link(source, a1), link(a2, a1), link(a2, a3), link(a4, a3),
            link(b1, source), link(b1, b2), link(b2, b3), link(b4, b3),
        ])

    with database.session_scope() as session:
        req = FileMatchesRequest(file=source, hops=0)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source])

    with database.session_scope() as session:
        req = FileMatchesRequest(file=source, hops=1)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source, a1, b1])

    with database.session_scope() as session:
        req = FileMatchesRequest(file=source, hops=2)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source, a1, a2, b1, b2])

    with database.session_scope() as session:
        req = FileMatchesRequest(file=source, hops=3)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source, a1, a2, a3, b1, b2, b3])

    with database.session_scope(expunge=True) as session:
        req = FileMatchesRequest(file=source, hops=4)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source, a1, a2, a3, a4, b1, b2, b3, b4])


def test_list_file_matches_filter_distance(database: Database):
    short, long = 0.1, 0.9
    with database.session_scope(expunge=True) as session:
        # Create files
        source = make_file()
        path_a = make_files(4)
        path_b = make_files(4)
        session.add(source)
        session.add_all(path_a)
        session.add_all(path_b)

        # Link files
        a1, a2, a3, a4 = path_a
        b1, b2, b3, b4 = path_b
        session.add_all([
            link(source, a1, short), link(a2, a1, short), link(a2, a3, short), link(a4, a3, short),
            link(b1, source, long), link(b1, b2, long), link(b2, b3, long), link(b4, b3, long),
        ])

    # Query all
    with database.session_scope(expunge=True) as session:
        req = FileMatchesRequest(file=source, hops=4)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source, a1, a2, a3, a4, b1, b2, b3, b4])

    # Query short
    with database.session_scope(expunge=True) as session:
        req = FileMatchesRequest(file=source, hops=4, max_distance=short)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source, a1, a2, a3, a4])

    # Query long
    with database.session_scope(expunge=True) as session:
        req = FileMatchesRequest(file=source, hops=4, min_distance=long)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source, b1, b2, b3, b4])


def test_list_file_matches_filter_cycles(database: Database):
    hops = 100
    with database.session_scope(expunge=True) as session:
        source = make_file()
        linked = make_files(2)
        prev1, prev2 = linked
        session.add_all([source, link(source, prev1), link(source, prev2)])

        for _ in range(hops - 1):
            cur1, cur2 = make_files(2)
            session.add_all([
                link(prev1, cur1), link(prev1, cur2),
                link(cur2, prev2), link(cur1, prev2)])
            linked.append(cur1)
            linked.append(cur2)
            prev1, prev2 = cur1, cur2

    # Query all
    with database.session_scope(expunge=True) as session:
        req = FileMatchesRequest(file=source, hops=hops)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source] + linked)

    # Query half
    with database.session_scope(expunge=True) as session:
        half = int(hops / 2)
        req = FileMatchesRequest(file=source, hops=half)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source] + linked[:2 * half])

    # Short cut the most distant items
    with database.session_scope(expunge=True) as session:
        session.add_all([link(source, cur1), link(source, cur2)])

    # Query half hops must return all files now
    with database.session_scope(expunge=True) as session:
        half = int(hops / 2)
        req = FileMatchesRequest(file=source, hops=half)
        resp = MatchesDAO.list_file_matches(req, session)
        assert_file_set(resp, expected=[source] + linked)
