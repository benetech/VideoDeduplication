import logging
from typing import Collection, Dict
from copy import deepcopy

from winnow.feature_extraction import SimilarityModel
from winnow.pipeline.extract_scene_level_features import scene_features_exist, extract_scene_level_features
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.storage.repr_utils import bulk_read, bulk_write

# Default module logger
logger = logging.getLogger(__name__)


def extract_scene_signatures(
    files: Collection[str], pipeline: PipelineContext, hashes=None, progress=ProgressMonitor.NULL
):
    """Calculate and save signatures for the given files to repr-storage."""

    files = tuple(files)

    remaining_video_paths = list(missing_scene_signatures(files, pipeline))

    # Ensure dependencies are satisfied
    if not scene_features_exist(remaining_video_paths, pipeline):
        extract_scene_level_features(remaining_video_paths, pipeline, progress=progress.subtask(0.9))
        progress = progress.subtask(0.1)

    # Skip step if required results already exist
    if not remaining_video_paths:
        logger.info("Representation storage contains all required signatures. Skipping...")
        progress.complete()
        return

    # Do calculate signatures
    logger.info("Starting signature extraction for %s of %s files", len(remaining_video_paths), len(files))
    signatures = extract_signatures(remaining_video_paths, pipeline)
    bulk_write(pipeline.repr_storage.scene_signature, signatures)

    logger.info("Done signature extraction.")
    progress.complete()


def missing_scene_signatures(files, pipeline: PipelineContext):
    """Get file paths with missing signatures."""
    signatures = pipeline.repr_storage.scene_signature

    for i, file_path in enumerate(files):
        if not signatures.exists(pipeline.filekey(file_path)):
            yield file_path


def scene_signatures_exist(files, pipeline: PipelineContext):
    """Check if all required signatures do exist."""

    return not any(missing_scene_signatures(files, pipeline))


def extract_signatures(files, pipeline: PipelineContext) -> Dict[FileKey, Collection[float]]:
    """Do extract signatures for the given video-files."""
    similarity_model = SimilarityModel()
    file_keys = [pipeline.filekey(file) for i, file in enumerate(files)]

    scene_features = bulk_read(pipeline.repr_storage.scene_level, select=file_keys)

    scene_features_separated = {}
    for key, features in scene_features.items():
        for i in range(features.shape[0]):
            new_path = str(key.path) + "(" + str(i) + ")"
            new_key = FileKey(path=new_path, hash=key.hash)
            scene_features_separated[new_key] = features[i : i + 1]

    return similarity_model.predict(scene_features_separated)
