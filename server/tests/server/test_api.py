import datetime
import json
import os
import tempfile
from contextlib import contextmanager
from http import HTTPStatus
from uuid import uuid4 as uuid

import pytest

from db.access.files import FileMatchFilter, FileSort
from db.schema import Files, Base, Exif, VideoMetadata, Scene, Matches
from server.config import Config
from server.main import create_application
from server.model import database


@contextmanager
def session_scope(app):
    """Create a application database session."""
    with app.app_context():
        session = database.session
        try:
            yield session
            # Flush changes so that expunged entities will have valid id attributes.
            session.flush()
            # Expunge all entities otherwise DetachedInstanceError will be raised upon access
            session.expunge_all()
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


def has_shape(data, shape):
    """Check if the data structure has the given shape."""
    # Dict pattern
    if isinstance(shape, dict):
        return isinstance(data, dict) and all(
            has_shape(data.get(key), value) for key, value in shape.items()
        )
    # List with known order
    elif isinstance(shape, list):
        return isinstance(data, list) and len(data) == len(shape) and all(
            has_shape(data[i], value) for i, value in enumerate(shape)
        )
    # Exact equality otherwise
    return data == shape


def json_payload(resp):
    """Get JSON payload of the given response."""
    return json.loads(resp.data.decode("utf-8"))


def items(resp):
    """Get items from JSON payload."""
    return json_payload(resp)["items"]


def assert_json_response(resp, expected):
    """Check if the response is a successful response with JSON-payload."""
    assert resp.status_code == HTTPStatus.OK.value
    assert "application/json" in resp.headers["Content-Type"]

    data = json_payload(resp)
    assert has_shape(data, expected)


def assert_files(resp, expected, total=None, related=None, duplicates=None, unique=None):
    # set items expectations
    expected_shape = {
        "items": [{"file_path": file.file_path, "sha256": file.sha256} for file in expected]
    }
    # Set count expectations
    if total is not None:
        expected_shape["total"] = total
    if related is not None:
        expected_shape["related"] = related
    if duplicates is not None:
        expected_shape["duplicates"] = duplicates
    if unique is not None:
        expected_shape["unique"] = unique
    elif total is not None and related is not None:
        expected_shape["unique"] = total - related
    assert_json_response(resp, expected_shape)


def matched_files(matches):
    """Get files of the given matches."""
    files = set()
    for match in matches:
        files.add(match.query_video_file)
        files.add(match.match_video_file)
    return files


def refresh(session, *entities):
    """Refresh entities from the current session."""
    if not entities:
        return []
    return [session.query(entity.__class__).get(entity.id) for entity in entities]


def assert_same(actual, expected):
    """Assert actual payload items refers to expected entities."""
    actual_ids = {item["id"] for item in actual}
    expected_ids = {entity.id for entity in expected}
    assert actual_ids == expected_ids
    assert len(actual) == len(expected)


def make_file(prefix="", length=42, ext="flv", audio=True, date=datetime.date(2000, 1, 1),
              scenes=((0, 1), (1, 2))):
    """Create unique file."""
    path = f"{prefix}some/path/{uuid()}.{ext}"
    sha256 = f"hash-of-{path}"
    return Files(file_path=path, sha256=sha256,
                 exif=Exif(General_FileExtension=ext, Audio_Duration=float(audio),
                           General_Encoded_Date=date, General_Duration=length),
                 meta=VideoMetadata(),
                 scenes=[Scene(start_time=start, duration=duration) for start, duration in scenes])


def make_files(count, prefix="", length=42, ext="flv", audio=True, date=datetime.date(2000, 1, 1),
               scenes=((0, 1), (1, 2))):
    """Create a collection of unique files."""
    return [
        make_file(prefix=prefix, length=length, ext=ext, audio=audio, date=date, scenes=scenes) for _ in range(count)
    ]


def param_date(date):
    """Convert date to REST API parameter format."""
    return date.strftime("%Y-%m-%d")


def link(source, target, distance=0.5):
    """Create a match between files."""
    return Matches(query_video_file=source, match_video_file=target, distance=distance)


def attr(name):
    """Create attribute getter."""
    return lambda obj: getattr(obj, name)


@pytest.fixture
def index_content():
    """index.html file content."""
    return b"<html><head><title>test-title</title></head><body>test-body</body></html>"


@pytest.fixture
def static_folder(index_content):
    """Temporary static folder."""
    with tempfile.TemporaryDirectory() as static_directory:
        with open(os.path.join(static_directory, "index.html"), 'wb') as index_file:
            index_file.write(index_content)
        yield static_directory


@pytest.fixture
def cache_folder():
    """Temporary thumbnail cache folder."""
    with tempfile.TemporaryDirectory() as directory:
        yield directory


@pytest.fixture
def config(static_folder, cache_folder):
    """Test configuration."""
    config = Config()
    config.video_folder = ""
    config.database.override_uri = 'sqlite:///:memory:'
    config.thumbnail_cache_folder = cache_folder
    config.static_folder = static_folder
    yield config


@pytest.fixture
def app(config):
    """Create a test application instance."""
    app = create_application(config)
    database.init_app(app)
    with app.app_context():
        Base.metadata.create_all(bind=database.engine)
    return app


@pytest.fixture
def client(app):
    """Get flask application client."""
    with app.test_client() as client:
        yield client


def test_frontend_root(client, index_content):
    resp = client.get("/")
    assert resp.status_code == HTTPStatus.OK.value
    assert "text/html" in resp.headers["Content-Type"]
    assert resp.data == index_content


def test_frontend_url_path(client, index_content):
    resp = client.get("/some/non/api/path")
    assert resp.status_code == HTTPStatus.OK.value
    assert "text/html" in resp.headers["Content-Type"]
    assert resp.data == index_content


def test_get_file(client, app):
    with session_scope(app) as session:
        file = make_file()
        session.add(file)

    # No inclusion
    resp = client.get(f"/api/v1/files/{file.id}")
    assert_json_response(resp, {
        "id": file.id,
        "file_path": file.file_path,
        "sha256": file.sha256
    })
    assert {"scenes", "meta", "exif"}.isdisjoint(json_payload(resp).keys())

    # Include some fields
    resp = client.get(f"/api/v1/files/{file.id}?include=exif,scenes")
    assert_json_response(resp, {
        "id": file.id,
        "file_path": file.file_path,
        "sha256": file.sha256,
        "exif": {"General_Duration": file.exif.General_Duration},
        "scenes": [{"duration": scene.duration, "start_time": scene.start_time} for scene in file.scenes]
    })
    assert "meta" not in json_payload(resp)


def test_list_files_basic(client, app):
    with session_scope(app) as session:
        files = make_files(10)
        session.add_all(files)

    files = sorted(files, key=attr("id"))

    # All items
    resp = client.get(f"/api/v1/files/?offset=0&limit={len(files)}")
    assert_json_response(resp, {
        "total": len(files),
        "duplicates": 0,
        "related": 0,
        "unique": len(files),
        "items": [{"file_path": file.file_path, "sha256": file.sha256} for file in files]
    })


def test_list_files_offset(client, app):
    with session_scope(app) as session:
        files = make_files(10)
        session.add_all(files)

    files = sorted(files, key=attr("id"))

    # Offset half
    offset = int(len(files) / 2)
    resp = client.get(f"/api/v1/files/?offset={offset}&limit={len(files)}")
    assert_json_response(resp, {
        "total": len(files),
        "items": [{"file_path": file.file_path, "sha256": file.sha256} for file in files[offset:]]
    })


def test_list_files_limit(client, app):
    with session_scope(app) as session:
        files = make_files(10)
        session.add_all(files)

    files = sorted(files, key=attr("id"))

    # Limit half
    limit = int(len(files) / 2)
    resp = client.get(f"/api/v1/files/?offset=0&limit={limit}")
    assert_json_response(resp, {
        "total": len(files),
        "items": [{"file_path": file.file_path, "sha256": file.sha256} for file in files[:limit]]
    })


def test_list_files_include(client, app):
    expected_length = 42
    expected_scene = {"start_time": 0, "duration": expected_length}
    with session_scope(app) as session:
        files = make_files(10, scenes=[(expected_scene["start_time"], expected_scene["duration"])],
                           length=expected_length)
        session.add_all(files)

    files = sorted(files, key=attr("id"))

    # No additional fields included
    resp = client.get(f"/api/v1/files/?offset=0&limit={len(files)}")
    assert len(items(resp)) == len(files)
    assert all(
        {"meta", "scenes", "exif"}.isdisjoint(file.keys()) for file in items(resp)
    )

    # With scenes and meta included
    resp = client.get(f"/api/v1/files/?limit={len(files)}&include=scenes,exif")
    assert len(items(resp)) == len(files)
    assert all(
        "meta" not in file for file in items(resp)
    )
    assert all(
        has_shape(file, {
            "scenes": [expected_scene],
            "exif": {"General_Duration": expected_length}
        }) for file in items(resp)
    )


def test_list_files_filter_length(client, app):
    duration_short, duration_long = 1, 100
    with session_scope(app) as session:
        short = make_files(5, length=duration_short)
        long = make_files(10, length=duration_long)
        session.add_all(short)
        session.add_all(long)

    short = sorted(short, key=attr("id"))
    long = sorted(long, key=attr("id"))
    all_files = sorted(short + long, key=attr("id"))

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files))

    # Get short
    resp = client.get(f"/api/v1/files/?max_length={duration_short}&limit={len(short)}")
    assert_files(resp, expected=short, total=len(short))

    # Get long
    resp = client.get(f"/api/v1/files/?min_length={duration_long}&limit={len(long)}")
    assert_files(resp, expected=long, total=len(long))


def test_list_files_filter_audio(client, app):
    with session_scope(app) as session:
        silent = make_files(5, audio=False)
        audible = make_files(10, audio=True)
        session.add_all(silent)
        session.add_all(audible)

    silent = sorted(silent, key=attr("id"))
    audible = sorted(audible, key=attr("id"))
    all_files = sorted(silent + audible, key=attr("id"))

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files))

    # Get silent
    resp = client.get(f"/api/v1/files/?audio=false&limit={len(silent)}")
    assert_files(resp, expected=silent, total=len(silent))

    # Get audible
    resp = client.get(f"/api/v1/files/?audio=true&limit={len(audible)}")
    assert_files(resp, expected=audible, total=len(audible))


def test_list_files_filter_extension(client, app):
    with session_scope(app) as session:
        flvs = make_files(5, ext="flv")
        mp4s = make_files(10, ext="mp4")
        session.add_all(flvs)
        session.add_all(mp4s)

    flvs = sorted(flvs, key=attr("id"))
    mp4s = sorted(mp4s, key=attr("id"))
    all_files = sorted(flvs + mp4s, key=attr("id"))

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files))

    # Get FLVs
    resp = client.get(f"/api/v1/files/?extensions=flv&limit={len(flvs)}")
    assert_files(resp, expected=flvs, total=len(flvs))

    # Get MP4s
    resp = client.get(f"/api/v1/files/?extensions=mp4&limit={len(mp4s)}")
    assert_files(resp, expected=mp4s, total=len(mp4s))

    # Get both
    resp = client.get(f"/api/v1/files/?extensions=flv,mp4&limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files))


def test_list_files_filter_date(client, app):
    long_ago, recently = datetime.date(1900, 1, 1), datetime.date(2020, 1, 1)
    with session_scope(app) as session:
        old = make_files(5, date=long_ago)
        new = make_files(10, date=recently)
        session.add_all(old)
        session.add_all(new)

    old = sorted(old, key=attr("id"))
    new = sorted(new, key=attr("id"))
    all_files = sorted(old + new, key=attr("id"))

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files))

    # Get old
    resp = client.get(f"/api/v1/files/?date_to={param_date(long_ago)}&limit={len(old)}")
    assert_files(resp, expected=old, total=len(old))

    # Get recent
    resp = client.get(f"/api/v1/files/?date_from={param_date(recently)}&limit={len(new)}")
    assert_files(resp, expected=new, total=len(new))

    # Get both
    resp = client.get(
        f"/api/v1/files/?date_from={param_date(long_ago)}&date_to={param_date(recently)}&limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files))


def test_list_files_filter_path(client, app):
    first_prefix, second_prefix, common = "aaabbb", "bbbccc", "bbb"
    with session_scope(app) as session:
        first = make_files(5, prefix=first_prefix)
        second = make_files(10, prefix=second_prefix)
        session.add_all(first)
        session.add_all(second)

    first = sorted(first, key=attr("id"))
    second = sorted(second, key=attr("id"))
    all_files = sorted(first + second, key=attr("id"))

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files))

    # Get by the first path prefix
    resp = client.get(f"/api/v1/files/?path={first_prefix}&limit={len(first)}")
    assert_files(resp, expected=first, total=len(first))

    # Get by the second path prefix
    resp = client.get(f"/api/v1/files/?path={second_prefix}&limit={len(second)}")
    assert_files(resp, expected=second, total=len(second))

    # Get by common substring
    resp = client.get(f"/api/v1/files/?path={common}&limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files))


def test_list_files_filter_matches(client, app, config):
    with session_scope(app) as session:
        all_files = make_files(10)
        a, b, c, d, e, *unique = all_files
        session.add_all(all_files)
        session.add_all([
            link(a, b, distance=config.duplicate_distance - 0.001),
            link(a, c, distance=config.duplicate_distance - 0.001),
            link(d, e, distance=config.related_distance - 0.001)
        ])

    all_files = sorted(all_files, key=attr("id"))
    duplicates = sorted([a, b, c], key=attr("id"))
    related = sorted([a, b, c, d, e], key=attr("id"))
    unique = sorted(unique, key=attr("id"))

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files), related=len(related), duplicates=len(duplicates))

    # Get all explicitly
    resp = client.get(f"/api/v1/files/?matches={FileMatchFilter.ALL}&limit={len(all_files)}")
    assert_files(resp, expected=all_files, total=len(all_files), related=len(related), duplicates=len(duplicates))

    # Get unique
    resp = client.get(f"/api/v1/files/?matches={FileMatchFilter.UNIQUE}&limit={len(all_files)}")
    assert_files(resp, expected=unique, total=len(all_files), related=len(related), duplicates=len(duplicates))

    # Get related
    resp = client.get(f"/api/v1/files/?matches={FileMatchFilter.RELATED}&limit={len(all_files)}")
    assert_files(resp, expected=related, total=len(all_files), related=len(related), duplicates=len(duplicates))

    # Get duplicates
    resp = client.get(f"/api/v1/files/?matches={FileMatchFilter.DUPLICATES}&limit={len(all_files)}")
    assert_files(resp, expected=duplicates, total=len(all_files), related=len(related), duplicates=len(duplicates))


def test_list_files_sort_date(client, app):
    long_ago, recently = datetime.date(1900, 1, 1), datetime.date(2020, 1, 1)
    with session_scope(app) as session:
        old = make_files(5, date=long_ago)
        new = make_files(10, date=recently)
        session.add_all(old)
        session.add_all(new)

    old = sorted(old, key=attr("id"))
    new = sorted(new, key=attr("id"))
    all_date_sorted = new + old

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_date_sorted)}&sort={FileSort.DATE}")
    assert_files(resp, expected=all_date_sorted, total=len(all_date_sorted))

    # Get old
    resp = client.get(f"/api/v1/files/?limit={len(all_date_sorted)}&offset={len(new)}&sort={FileSort.DATE}")
    assert_files(resp, expected=old, total=len(all_date_sorted))


def test_list_files_sort_length(client, app):
    with session_scope(app) as session:
        short = make_files(5, length=1)
        long = make_files(10, length=100)
        session.add_all(short)
        session.add_all(long)

    short = sorted(short, key=attr("id"))
    long = sorted(long, key=attr("id"))
    all_length_sorted = long + short

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_length_sorted)}&sort={FileSort.LENGTH}")
    assert_files(resp, expected=all_length_sorted, total=len(all_length_sorted))

    # Get short
    resp = client.get(f"/api/v1/files/?limit={len(all_length_sorted)}&offset={len(long)}&sort={FileSort.LENGTH}")
    assert_files(resp, expected=short, total=len(all_length_sorted))


def test_list_files_sort_duplicates(client, app, config):
    with session_scope(app) as session:
        all_files = make_files(10)
        a, b, c, d, e, *unique = all_files
        session.add_all(all_files)
        session.add_all([
            link(a, b, distance=config.duplicate_distance - 0.001),
            link(a, c, distance=config.duplicate_distance - 0.001),
            link(d, e, distance=config.related_distance - 0.001)
        ])

    all_dup_sorted = [a] + sorted([b, c], key=attr("id")) + sorted([d, e] + unique, key=attr("id"))

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_dup_sorted)}&sort={FileSort.DUPLICATES}")
    assert_files(resp, expected=all_dup_sorted, total=len(all_dup_sorted))

    # Get slice
    offset = int(len(all_dup_sorted) / 2)
    limit = int(len(all_dup_sorted) / 4)
    resp = client.get(f"/api/v1/files/?limit={limit}&offset={offset}&sort={FileSort.DUPLICATES}")
    assert_files(resp, expected=all_dup_sorted[offset:offset + limit], total=len(all_dup_sorted))


def test_list_files_sort_related(client, app, config):
    with session_scope(app) as session:
        all_files = make_files(10)
        a, b, c, d, e, *unique = all_files
        session.add_all(all_files)
        session.add_all([
            link(a, b, distance=config.duplicate_distance - 0.001),
            link(a, c, distance=config.duplicate_distance - 0.001),
            link(d, e, distance=config.related_distance - 0.001),
            link(d, c, distance=config.related_distance - 0.001),
        ])

    all_rel_sorted = sorted([a, c, d], key=attr("id")) + sorted([b, e], key=attr("id")) + sorted(unique, key=attr("id"))

    # Get all
    resp = client.get(f"/api/v1/files/?limit={len(all_rel_sorted)}&sort={FileSort.RELATED}")
    assert_files(resp, expected=all_rel_sorted, total=len(all_rel_sorted))

    # Get slice
    offset = int(len(all_rel_sorted) / 2)
    limit = int(len(all_rel_sorted) / 4)
    resp = client.get(f"/api/v1/files/?limit={limit}&offset={offset}&sort={FileSort.RELATED}")
    assert_files(resp, expected=all_rel_sorted[offset:offset + limit], total=len(all_rel_sorted))


def test_list_files_mixed_example(client, app, config):
    length_small = 1
    length_large = 100
    with session_scope(app) as session:
        all_files = make_files(10, length=length_small)
        a, b, c, d, e, f, *remaining = all_files
        session.add_all(all_files)
        session.add_all([
            link(a, b, distance=config.duplicate_distance - 0.001),
            link(a, c, distance=config.duplicate_distance - 0.001),
            link(d, e, distance=config.related_distance - 0.001),
            link(d, c, distance=config.related_distance - 0.001),
        ])

        # Long videos
        b.exif.General_Duration = length_large  # duplicates: a
        c.exif.General_Duration = length_large  # duplicates: a, related: d
        e.exif.General_Duration = length_large  # related: d
        f.exif.General_Duration = length_large  # no matches

    # Get long videos with related matches sorted by amount of duplicates
    resp = client.get(
        f"/api/v1/files/?"
        f"min_length={length_large}&"
        f"matches={FileMatchFilter.RELATED}&"
        f"sort={FileSort.DUPLICATES}&"
        f"limit={len(all_files)}")
    expected = sorted([b, c], key=attr("id")) + [e]
    assert_files(resp, expected, total=4, related=len(expected))

    # Get short videos with related matches sorted by amount of duplicates
    resp = client.get(
        f"/api/v1/files/?"
        f"max_length={length_small}&"
        f"matches={FileMatchFilter.RELATED}&"
        f"sort={FileSort.DUPLICATES}&"
        f"limit={len(all_files)}")
    expected = [a, d]
    assert_files(resp, expected, total=len(all_files) - 4, related=len(expected))

    # Get long unique videos
    resp = client.get(
        f"/api/v1/files/?"
        f"min_length={length_large}&"
        f"matches={FileMatchFilter.UNIQUE}&"
        f"sort={FileSort.RELATED}&"
        f"limit={len(all_files)}")
    expected = [f]
    assert_files(resp, expected, total=4)


def test_list_file_matches_basic(client, app):
    with session_scope(app) as session:
        all_files = make_files(5)
        source, a, b, c, d = all_files
        session.add_all(all_files)

        matches = [
            link(source, a),
            link(source, b),
            link(source, c),
            link(source, d),
        ]
        session.add_all(matches)

    matches = sorted(matches, key=attr("id"))

    # Get all matches
    resp = client.get(f"/api/v1/files/{source.id}/matches")
    assert_json_response(resp, {
        "total": len(matches),
        "items": [
            {"distance": match.distance, "file": {"id": match.match_video_file_id}} for match in matches
        ]
    })

    # Get slice
    offset = 1
    limit = 2
    resp = client.get(f"/api/v1/files/{source.id}/matches?offset={offset}&limit={limit}")
    assert_json_response(resp, {
        "total": len(matches),
        "items": [
            {
                "distance": match.distance,
                "file": {"id": match.match_video_file_id}
            } for match in matches[offset:offset + limit]
        ]
    })


def test_list_file_matches_include(client, app):
    with session_scope(app) as session:
        source, a, b = make_files(3)
        session.add_all([source, a, b])

        matches = [
            link(source, a),
            link(source, b),
        ]
        session.add_all(matches)

    matches = sorted(matches, key=attr("id"))

    # Don't include additional fields
    resp = client.get(f"/api/v1/files/{source.id}/matches")
    assert all(
        {"exif", "meta", "scenes"}.isdisjoint(match["file"].keys()) for match in items(resp)
    )

    # Include meta and exif
    resp = client.get(f"/api/v1/files/{source.id}/matches?include=meta,exif")
    assert_json_response(resp, {
        "total": len(matches),
        "items": [
            {
                "file": {
                    "exif": {
                        "General_FileExtension": match.match_video_file.exif.General_FileExtension,
                        "General_Duration": match.match_video_file.exif.General_Duration
                    }
                }
            } for match in matches
        ]
    })
    assert all(
        "scenes" not in match["file"].keys() for match in items(resp)
    )


def test_fetch_file_cluster_basic(client, app):
    with session_scope(app) as session:
        all_files = make_files(5)
        source, a, b, c, d = all_files
        session.add_all(all_files)

        matches = [
            link(source, a),
            link(source, b),
            link(source, c),
            link(source, d),
        ]
        session.add_all(matches)

    all_files = sorted(all_files, key=attr("id"))
    matches = sorted(matches, key=attr("id"))

    # Get all matches
    resp = client.get(f"/api/v1/files/{source.id}/cluster")
    assert_json_response(resp, {
        "total": len(matches),
        "matches": [
            {
                "distance": match.distance,
                "source": match.query_video_file_id,
                "target": match.match_video_file_id
            } for match in matches
        ],
        "files": [{"file_path": file.file_path, "sha256": file.sha256} for file in all_files]
    })

    # Get slice
    offset = 1
    limit = 2
    resp = client.get(f"/api/v1/files/{source.id}/cluster?offset={offset}&limit={limit}")
    assert_json_response(resp, {
        "total": len(matches),
        "matches": [
            {
                "distance": match.distance,
                "source": match.query_video_file_id,
                "target": match.match_video_file_id
            } for match in matches[offset:offset + limit]
        ],
    })
    payload = json_payload(resp)
    assert_same(payload["files"], matched_files(matches[offset:offset + limit]))


def test_fetch_file_cluster_include(client, app):
    with session_scope(app) as session:
        source, a, b = make_files(3)
        session.add_all([source, a, b])

        matches = [
            link(source, a),
            link(source, b),
        ]
        session.add_all(matches)

    files = sorted([source, a, b], key=attr("id"))
    matches = sorted(matches, key=attr("id"))

    # Don't include additional fields
    resp = client.get(f"/api/v1/files/{source.id}/cluster")
    assert all(
        {"exif", "meta", "scenes"}.isdisjoint(file.keys()) for file in json_payload(resp)["files"]
    )

    # Include meta and exif
    resp = client.get(f"/api/v1/files/{source.id}/cluster?include=meta,exif")
    assert_json_response(resp, {
        "total": len(matches),
        "files": [
            {
                "exif": {
                    "General_FileExtension": file.exif.General_FileExtension,
                    "General_Duration": file.exif.General_Duration
                }

            } for file in files
        ]
    })
    assert all(
        "scenes" not in file.keys() for file in json_payload(resp)["files"]
    )


def test_fetch_file_cluster_hops(client, app):
    hops = 100
    with session_scope(app) as session:
        source = make_file()
        linked = make_files(2)
        prev1, prev2 = linked
        matches = [link(source, prev1), link(source, prev2)]

        for _ in range(hops - 1):
            cur1, cur2 = make_files(2)
            matches.extend([
                link(prev1, cur1), link(prev1, cur2),
                link(cur2, prev2), link(cur1, prev2)])
            linked.append(cur1)
            linked.append(cur2)
            prev1, prev2 = cur1, cur2
        session.add_all(matches)

    matches.sort(key=attr("id"))

    # Query all
    resp = client.get(f"/api/v1/files/{source.id}/cluster?hops={hops}&limit={len(matches)}")
    payload = json_payload(resp)
    assert_same(payload["matches"], matches)
    assert_same(payload["files"], [source] + linked)

    # Query half
    half = int(hops / 2)
    resp = client.get(f"/api/v1/files/{source.id}/cluster?hops={half}&limit={len(matches)}")
    assert_same(json_payload(resp)["files"], [source] + linked[:2 * half])

    # Create a short cut from the source to the most distant items
    with session_scope(app) as session:
        source, cur1, cur2 = refresh(session, source, cur1, cur2)
        short_cut = [link(source, cur1), link(source, cur2)]
        session.add_all(short_cut)
        matches.extend(short_cut)

    # Query half hops must return all files now
    resp = client.get(f"/api/v1/files/{source.id}/cluster?hops={half}&limit={len(matches) + 2}")
    payload = json_payload(resp)
    assert_same(payload["matches"], matches)
    assert_same(payload["files"], [source] + linked)
