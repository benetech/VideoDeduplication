import math

from db.schema import Exif, Files, Matches
from server.model import Transform, entity_fields


def test_transform_nan():
    exif = Exif(
        General_FileSize=math.inf,
        General_Duration=-math.inf,
        Video_FrameRate=math.nan
    )

    data = Transform.exif_dict(exif)
    assert data["General_FileSize"] is None
    assert data["General_Duration"] is None
    assert data["Video_FrameRate"] is None


def test_transform_exif():
    exif = Exif(
        General_FileExtension="mp4",
        General_FileSize=0.5,
        General_Duration=0.5,
    )

    data = Transform.exif_dict(exif)
    assert data["General_FileExtension"] == exif.General_FileExtension
    assert data["General_FileSize"] == exif.General_FileSize
    assert data["General_Duration"] == exif.General_Duration
    assert data["General_OverallBitRate_Mode"] is None

    exclude = {"id", "file_id", "file", "Json_full_exif"}
    assert set(data.keys()) == entity_fields(Exif) - exclude


def test_transform_match():
    source = Files(id=1, file_path="foo")
    target = Files(id=2, file_path="bar")
    match = Matches(query_video_file=source, match_video_file=target, distance=0.5)

    # Check outgoing match
    data = Transform.file_match_dict(match, source.id)
    assert data["distance"] == match.distance
    assert data["file"]["id"] == target.id
    assert data["file"]["file_path"] == target.file_path

    # Check incoming match
    data = Transform.file_match_dict(match, target.id)
    assert data["distance"] == match.distance
    assert data["file"]["id"] == source.id
    assert data["file"]["file_path"] == source.file_path


def test_transform_file():
    file = Files(file_path="foo", exif=Exif(General_FileSize=42.0))

    # Exclude exif
    data = Transform.file_dict(file)
    assert data["file_path"] == file.file_path
    assert "exif" not in data

    # Include exif
    data = Transform.file_dict(file, exif=True)
    assert data["file_path"] == file.file_path
    assert data["exif"]["General_FileSize"] == file.exif.General_FileSize
