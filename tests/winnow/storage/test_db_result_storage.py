import pytest
from dataclasses import dataclass, astuple
from sqlalchemy.orm import eagerload

from db import Database
from db.schema import Files, Matches, VideoMetadata, Signature, Exif, Scene
from winnow.storage.db_result_storage import DBResultStorage


def match_tuple(match):
    source = match.query_video_file
    target = match.match_video_file
    return source.file_path, source.sha256, target.file_path, target.sha256, match.distance


def query(store, what):
    """Get all database items."""
    with store.database.session_scope() as session:
        items = session.query(what).options(eagerload('*')).all()
        session.expunge_all()
        return items


def count(store, what):
    return len(query(store, what))


@dataclass
class File:
    """Convenience data structure for managing test data."""
    path: str
    sha256: str
    value: object

    def __iter__(self):
        """
        Allow file to act as a tuple in expressions
        like: path, sha256, value = file. This will
        let to pass this class to DBResultStorage.
        """
        return iter(astuple(self))


@pytest.fixture
def store():
    """Database storage fixture."""
    in_memory_database = Database.in_memory(echo=False)
    in_memory_database.create_tables()
    return DBResultStorage(in_memory_database)


def check_results(actual_files, expected, value):
    assert len(actual_files) == len(expected)

    index = {(file.file_path, file.sha256): value(file) for file in actual_files}
    for expected_file in expected:
        actual_value = index[(expected_file.path, expected_file.sha256)]
        assert actual_value == expected_file.value


def check_files(store, expected, value):
    files = query(store, Files)
    check_results(files, expected, value)


def test_add_file_signature(store):
    # Check signature write
    orig = File("some/path", "some-hash", b"some-signature")
    store.add_file_signature(orig.path, orig.sha256, orig.value)
    check_files(store, [orig], value=lambda file: file.signature.signature)

    # Check signature update
    updated = File(orig.path, orig.sha256, b"other-than" + orig.value)
    store.add_file_signature(orig.path, orig.sha256, updated.value)
    check_files(store, [updated], value=lambda file: file.signature.signature)

    # Check no duplication
    assert count(store, Signature) == 1


def test_add_signatures_update(store):
    # Check bulk write signatures
    saved = [File(f"some/path{i}", f"some-hash{i}", b"some-signature") for i in range(100)]
    store.add_signatures(saved)
    check_files(store, saved, lambda file: file.signature.signature)

    # Check bulk update signatures
    updated = [File(orig.path, orig.sha256, b"other than" + orig.value) for orig in saved]
    store.add_signatures(updated)
    check_files(store, updated, value=lambda item: item.signature.signature)

    # Check no entity duplication
    assert count(store, Signature) == len(updated)


def test_add_file_metadata(store):
    # Check metadata write
    orig = File("some/path", "some-hash", {"gray_avg": 42.5})
    store.add_file_metadata(orig.path, orig.sha256, orig.value)
    check_files(store, [orig], lambda file: {"gray_avg": file.meta.gray_avg})

    # Check metadata updated
    updated = File(orig.path, orig.sha256, {"gray_avg": orig.value["gray_avg"] + 1})
    store.add_file_metadata(orig.path, orig.sha256, updated.value)
    check_files(store, [updated], lambda file: {"gray_avg": file.meta.gray_avg})

    # Check no entity duplication
    assert count(store, VideoMetadata) == 1


def test_add_metadata(store):
    # Check bulk write
    saved = [File(f"some/path{i}", f"some-hash{i}", {"gray_avg": float(i)}) for i in range(100)]
    store.add_metadata(saved)
    check_files(store, saved, lambda file: {"gray_avg": file.meta.gray_avg})

    # Check bulk update
    updated = [File(orig.path, orig.sha256, {"gray_avg": orig.value["gray_avg"] + 1.0}) for orig in saved]
    store.add_metadata(updated)
    check_files(store, updated, lambda file: {"gray_avg": file.meta.gray_avg})

    # Check no entity duplication
    assert count(store, VideoMetadata) == len(updated)


def test_add_file_exif(store):
    # Check metadata write
    orig = File("some/path", "some-hash", {"Video_Width": 42.5})
    store.add_file_exif(orig.path, orig.sha256, orig.value)
    check_files(store, [orig], lambda file: {"Video_Width": file.exif.Video_Width})

    # Check metadata updated
    updated = File(orig.path, orig.sha256, {"Video_Width": orig.value["Video_Width"] + 1.0})
    store.add_file_exif(orig.path, orig.sha256, updated.value)
    check_files(store, [updated], lambda file: {"Video_Width": file.exif.Video_Width})

    # Check no entity duplication
    assert count(store, Exif) == 1


def test_add_exif(store):
    # Check bulk write
    saved = [File(f"some/path{i}", f"some-hash{i}", {"Video_Width": float(i)}) for i in range(100)]
    store.add_exifs(saved)
    check_files(store, saved, lambda file: {"Video_Width": file.exif.Video_Width})

    # Check bulk update
    updated = [File(orig.path, orig.sha256, {"Video_Width": orig.value["Video_Width"] + 1.0}) for orig in saved]
    store.add_exifs(updated)
    check_files(store, updated, lambda file: {"Video_Width": file.exif.Video_Width})

    # Check no entity duplication
    assert count(store, Exif) == len(updated)


def test_add_file_scenes(store):
    # Check save
    orig = File("some/path", "some-hash", list(range(10)))
    store.add_file_scenes(*orig)
    check_files(store, [orig], lambda file: [scene.duration for scene in file.scenes])

    # Check update
    updated = File(*orig)
    updated.value = [duration + 1 for duration in orig.value]
    store.add_file_scenes(*updated, override=True)
    check_files(store, [updated], lambda file: [scene.duration for scene in file.scenes])

    # Check no duplicates
    assert count(store, Scene) == len(updated.value)


def test_add_scenes(store):
    # Check save
    saved = [File(f"some/path{i}", f"some-hash{i}", list(range(10))) for i in range(100)]
    store.add_scenes(saved)
    check_files(store, saved, lambda file: [scene.duration for scene in file.scenes])

    # Check update
    updated = [File(orig.path, orig.sha256, sorted(orig.value + [2])) for orig in saved]
    store.add_scenes(updated, override=True)
    check_files(store, updated, lambda file: sorted([scene.duration for scene in file.scenes]))

    # Check no duplication
    assert count(store, Scene) == sum(len(file.value) for file in updated)


def test_add_matches(store):
    # Check save
    saved = [
        ("path_1", "hash_1", "path_2", "hash_2", 0.5),
        ("path_1", "hash_1", "path_3", "hash_3", 0.6),
        ("path_3", "hash_3", "path_2", "hash_2", 0.7)
    ]

    store.add_matches(saved)

    assert count(store, Matches) == 3

    actual = map(match_tuple, query(store, Matches))
    assert set(actual) == set(saved)

    # Check update
    updates = [("path_1", "hash_1", "path_2", "hash_2", 0.0)]
    store.add_matches(updates)

    assert count(store, Matches) == 3

    actual = map(match_tuple, query(store, Matches))
    assert set(actual) - set(saved) == set(updates)
