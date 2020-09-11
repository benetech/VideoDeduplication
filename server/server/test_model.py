import base64

from db.schema import Files, Signature
from server.model import Transform


def make_file():
    file = Files(id=1, file_path="/some/path", sha256="some-hash")
    Signature(id=2, signature=b"some-fingerprint", file=file)
    return file


def test_transform_basic():
    file = make_file()

    result = Transform.dict(file)

    assert result["file_path"] == file.file_path
    assert result["sha256"] == file.sha256

    sig = result["signature"]
    assert sig["id"] == file.signature.id
    assert sig["signature"] == base64.encodebytes(file.signature.signature)
    assert "file" not in sig


def test_transform_inclusion():
    file = make_file()

    result = Transform.dict(file, signature=False, sha256=False, file_path=True)

    assert "signature" not in result
    assert "sha265" not in result
    assert result["file_path"] == file.file_path
