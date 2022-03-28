import os
import tempfile

import pytest

from db.schema import Files
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.storage.file_key import FileKey
from winnow.utils.config import resolve_config
from winnow.utils.files import scan_videos


def file_key(file: Files) -> FileKey:
    """Get file repr-storage key."""
    return FileKey(path=file.file_path, hash=file.sha256)


@pytest.fixture(scope="module")
def config():
    """Resolve test configuration."""
    test_folder = os.path.dirname(__file__)
    config = resolve_config(config_path=os.path.join(test_folder, "config.yaml"))
    with tempfile.TemporaryDirectory(prefix="representations-") as temp_directory:
        config.repr.directory = temp_directory
        config.database.use = True
        config.database.uri = f"sqlite:///{os.path.join(temp_directory, 'test.sqlite')}"
        yield config


@pytest.fixture(scope="module")
def pipeline(config):
    """Create pipeline context."""
    return PipelineContext(config)


@pytest.fixture(scope="module")
def dataset(config):
    """Get list of test dataset videos."""
    return scan_videos(config.sources.root, wildcard="**", extensions=config.sources.extensions)


# FIXME: Fix broken tests #476


def test_dummy():
    """Just do nothing."""
    pass


# def test_extract_frame_level_features(dataset, pipeline: PipelineContext):
#     extract_frame_level_features(files=dataset, pipeline=pipeline)
#     features_storage = pipeline.repr_storage.frame_level
#     values = bulk_read(features_storage).values()
#
#     assert set(features_storage.list()) == set(map(pipeline.filekey, dataset))
#     assert sum(feature.shape[1] == 4096 for feature in values) == len(dataset)
#
#
# def test_extract_video_level_features(dataset, pipeline: PipelineContext):
#     extract_video_level_features(files=dataset, pipeline=pipeline)
#     features_storage = pipeline.repr_storage.video_level
#     values = bulk_read(features_storage).values()
#
#     assert set(features_storage.list()) == set(map(pipeline.filekey, dataset))
#     assert sum(feature.shape[1] == 4096 for feature in values) == len(dataset)
#
#
# def test_extract_video_signatures(dataset, pipeline: PipelineContext):
#     extract_video_signatures(files=dataset, pipeline=pipeline)
#     signatures_storage = pipeline.repr_storage.signature
#     signatures = bulk_read(signatures_storage).values()
#
#     assert set(signatures_storage.list()) == set(map(pipeline.filekey, dataset))
#     assert sum(sig.shape == (500,) for sig in signatures)
#
#
# def test_signatures_are_saved(dataset, pipeline: PipelineContext):
#     store_database_signatures(files=dataset, pipeline=pipeline)
#     signature_storage = pipeline.repr_storage.signature
#     with pipeline.database.session_scope(expunge=True) as session:
#         files = session.query(Files).all()
#         db_signatures = {file_key(file): list(pickle.loads(file.signature.signature)) for file in files}
#
#     repr_signatures = bulk_read(signature_storage)
#     repr_signatures = {key: list(value) for key, value in repr_signatures.items()}
#
#     assert db_signatures == repr_signatures
