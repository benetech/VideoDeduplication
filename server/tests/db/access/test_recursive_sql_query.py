# import itertools
# import os
# from uuid import uuid4 as uuid
#
# import pytest
#
# from db import Database
# from db.schema import Files, Exif, VideoMetadata, Scene, Matches
#
#
# def make_file(prefix="", length=42, ext="flv", scenes=((0, 1), (1, 2))):
#     """Create unique file."""
#     path = f"{prefix}some/path/{uuid()}.{ext}"
#     sha256 = f"hash-of-{path}"
#     return Files(file_path=path, sha256=sha256,
#                  exif=Exif(General_FileExtension=ext, ),
#                  meta=VideoMetadata(video_length=length),
#                  scenes=[Scene(start_time=start, duration=duration) for start, duration in scenes])
#
#
# def make_files(count, prefix="", length=42, ext="flv", scenes=((0, 1), (1, 2))):
#     """Create a collection of unique files."""
#     return [
#         make_file(prefix=prefix, length=length, ext=ext, scenes=scenes) for _ in range(count)
#     ]
#
#
# def link(source, target, distance=0.5):
#     """Create a match between files."""
#     return Matches(query_video_file=source, match_video_file=target, distance=distance)
#
#
# @pytest.fixture
# def database():
#     """Create test database."""
#     in_memory_database = Database.in_memory(echo=False)
#     in_memory_database.create_tables()
#     return in_memory_database
#
#
# def pop(queue, max_count):
#     """Pop multiple items from queue."""
#     result = []
#     for _ in range(max_count):
#         if len(queue) == 0:
#             return result
#         result.append(queue.pop())
#     return result
#
#
# def chunks(iterable, size=100):
#     """Split iterable into equal-sized chunks."""
#     iterator = iter(iterable)
#     chunk = list(itertools.islice(iterator, size))
#     while chunk:
#         yield chunk
#         chunk = list(itertools.islice(iterator, size))
#
#
# def assert_same(actual, expected):
#     """Check result id set."""
#     expected_ids = {entity.id for entity in expected}
#     actual_ids = {entity.id for entity in actual}
#     assert actual_ids == expected_ids
#
#
# def read_file(name):
#     with open(os.path.join(os.path.dirname(__file__), name)) as file:
#         return file.read()
#
#
# def test_expression(database: Database):
#     with database.session_scope(expunge=True) as session:
#         source = make_file("source")
#         a1, a2, a3 = make_files(3)
#         session.add_all([link(source, a1), link(a2, a1), link(a2, a3)])
#
#     with database.engine.connect() as con:
#         resp = con.execute(read_file("expression.sql"), id=source.id, limit=2)
#     res = list(resp)
#     print(resp)
