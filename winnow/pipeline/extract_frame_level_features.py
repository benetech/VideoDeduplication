import logging
import multiprocessing
from typing import Collection

from winnow.feature_extraction import IntermediateCnnExtractor
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.utils.files import create_video_list


def extract_frame_level_features(files: Collection[str], pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Extract frame-level features from dataset videos."""

    config = pipeline.config
    logger = logging.getLogger(__name__)

    files = tuple(files)
    remaining_video_paths = tuple(missing_frame_features(files, pipeline))

    # Skip step if required results already exist
    if not remaining_video_paths:
        logger.info("All required frame-level features already exist. Skipping...")
        progress.complete()
        return

    logger.info("Starting frame-level feature extraction for %s of %s files", len(remaining_video_paths), len(files))

    # Save list of processed files
    video_list_file = create_video_list(remaining_video_paths, config.proc.video_list_filename)
    logger.info("Processed video list is saved: %s", video_list_file)

    progress.scale(total_work=len(remaining_video_paths))

    def save_features(file_path, frames_tensor, frames_features):
        """Handle features extracted from a single video file."""
        key = pipeline.reprkey(file_path)
        pipeline.repr_storage.frame_level.write(key, frames_features)
        if pipeline.config.proc.save_frames:
            pipeline.repr_storage.frames.write(key, frames_tensor)
        progress.increase(1)

    extractor = IntermediateCnnExtractor(
        videos=remaining_video_paths,
        on_extracted=save_features,
        frame_sampling=config.proc.frame_sampling,
        model=pipeline.pretrained_model,
    )

    # Do extract frame-level features
    extractor.extract_features(batch_size=16, cores=multiprocessing.cpu_count())
    logger.info("Done frame-level feature extraction.")
    progress.complete()


def missing_frame_features(files, pipeline: PipelineContext):
    """Get file paths with missing frame-level features."""
    frame_features = pipeline.repr_storage.frame_level
    for file_path in files:
        if not frame_features.exists(pipeline.reprkey(file_path)):
            yield file_path


def frame_features_exist(files, pipeline: PipelineContext):
    """Check if all required frame-level features do exist."""
    return not any(missing_frame_features(files, pipeline))
