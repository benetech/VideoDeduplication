import logging
from typing import Collection

from winnow.feature_extraction.loading_utils import global_vector
from winnow.pipeline.extract_frame_level_features import (
    extract_frame_level_features,
    frame_features_exist,
)
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor

# Default module logger
logger = logging.getLogger(__name__)


def extract_video_level_features(
    files: Collection[str], pipeline: PipelineContext, hashes, progress=ProgressMonitor.NULL
):
    """Extract video-level features from the dataset videos."""

    files = tuple(files)
    remaining_video_paths, remaining_hashes = zip(*missing_video_features(files, pipeline, hashes))

    # Ensure dependencies are satisfied
    if not frame_features_exist(remaining_video_paths, pipeline, remaining_hashes):
        extract_frame_level_features(remaining_video_paths, pipeline, remaining_hashes, progress=progress.subtask(0.9))
        progress = progress.subtask(0.1)

    # Skip step if required results already exist
    if not remaining_video_paths:
        logger.info("All required video-level features already exist. Skipping...")
        progress.complete()
        return

    # Do convert frame-level features into video-level features.
    logger.info("Starting video-level feature extraction for %s of %s files", len(remaining_video_paths), len(files))
    frame_to_global(remaining_video_paths, pipeline, progress)
    logger.info("Done video-level feature extraction.")


def missing_video_features(files, pipeline: PipelineContext, hashes):
    """Get file paths with missing video-level features."""
    video_features = pipeline.repr_storage.video_level
    for i, file_path in enumerate(files):
        if not video_features.exists(pipeline.reprkey(file_path, hash=hashes[i])):
            yield file_path, hashes[i]


def video_features_exist(files, pipeline: PipelineContext, hashes):
    """Check if all required video-level features do exist."""
    return not any(missing_video_features(files, pipeline, hashes))


def frame_to_global(files, pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Calculate and save video-level feature vectors based on frame-level representation."""
    progress.scale(len(files))
    for key in map(pipeline.reprkey, files):
        try:
            frame_features = pipeline.repr_storage.frame_level.read(key)
            video_representation = global_vector(frame_features)
            pipeline.repr_storage.video_level.write(key, video_representation)
        except Exception:
            logger.exception("Error computing video-level features for file: %s", key)
        finally:
            progress.increase(1)
    progress.complete()
