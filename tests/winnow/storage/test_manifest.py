import tempfile

import pytest

from winnow.storage.manifest import InvalidManifest, StorageManifest, StorageManifestFile, IncompatibleManifest


@pytest.fixture
def tempdir():
    """Create temporary directory."""
    with tempfile.TemporaryDirectory(prefix="storage-manifest-tests-") as directory:
        yield directory


def test_validate():
    with pytest.raises(InvalidManifest):
        invalid_type = StorageManifest(type=None, version=1)
        invalid_type.ensure_valid()

    with pytest.raises(InvalidManifest):
        empty_type = StorageManifest(type="", version=1)
        empty_type.ensure_valid()

    with pytest.raises(InvalidManifest):
        invalid_version = StorageManifest(type="valid-type", version="invalid-version")
        invalid_version.ensure_valid()

    with pytest.raises(InvalidManifest):
        negative_version = StorageManifest(type="valid-type", version=-1)
        negative_version.ensure_valid()

    valid_manifest = StorageManifest(type="some-type", version=0)
    valid_manifest.ensure_valid()


def test_read(tempdir):
    manifest_file = StorageManifestFile(tempdir)
    default = StorageManifest(type="some-type", version=42)

    assert manifest_file.read() is None
    assert manifest_file.read(default=default) == default
    assert not manifest_file.exists()


def test_write(tempdir):
    manifest_file = StorageManifestFile(tempdir)
    saved_manifest = StorageManifest(type="something", version=42)

    manifest_file.write(saved_manifest)

    assert manifest_file.exists()
    assert manifest_file.read() == saved_manifest


def test_write_invalid(tempdir):
    manifest_file = StorageManifestFile(tempdir)
    invalid_manifest = StorageManifest(type="something", version="invalid-version")

    with pytest.raises(InvalidManifest):
        manifest_file.write(invalid_manifest)


def test_ensure_empty(tempdir):
    manifest_file = StorageManifestFile(tempdir)
    wanted = StorageManifest(type="something", version=42)

    manifest_file.ensure(wanted)

    assert manifest_file.read() == wanted


def test_ensure_equal(tempdir):
    manifest_file = StorageManifestFile(tempdir)
    wanted = StorageManifest(type="something", version=42)

    manifest_file.write(wanted)
    manifest_file.ensure(wanted)

    assert manifest_file.read() == wanted


def test_ensure_update(tempdir):
    manifest_file = StorageManifestFile(tempdir)
    existing = StorageManifest(type="existing", version=42)
    wanted = StorageManifest(type=existing.type, version=existing.version + 1)

    manifest_file.write(existing)
    manifest_file.ensure(wanted)

    assert manifest_file.read() == wanted


def test_ensure_downgrade(tempdir):
    manifest_file = StorageManifestFile(tempdir)
    existing = StorageManifest(type="existing", version=42)
    wanted = StorageManifest(type=existing.type, version=existing.version - 1)

    manifest_file.write(existing)

    with pytest.raises(IncompatibleManifest):
        manifest_file.ensure(wanted)


def test_ensure_incompatible(tempdir):
    manifest_file = StorageManifestFile(tempdir)
    existing = StorageManifest(type="existing", version=42)
    wanted = StorageManifest(type=f"other than {existing.type}", version=existing.version)

    manifest_file.write(existing)

    with pytest.raises(IncompatibleManifest):
        manifest_file.ensure(wanted)
