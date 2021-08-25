import os
import logging
from typing import Collection
import numpy as np
import pandas as pd

from winnow.feature_extraction.loading_utils import global_vector
from winnow.pipeline.extract_frame_level_features import (
    extract_frame_level_features,
    frame_features_exist,
)
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor

# Default module logger
logger = logging.getLogger(__name__)


def extract_scene_level_features(files: Collection[str], pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Extract scene-level features from the dataset videos."""

    files = tuple(files)
    remaining_video_paths = [*missing_scene_features(files, pipeline)]

    # Ensure dependencies are satisfied
    if not frame_features_exist(remaining_video_paths, pipeline):
        extract_frame_level_features(remaining_video_paths, pipeline, progress=progress.subtask(0.9))
        progress = progress.subtask(0.1)

    # Skip step if required results already exist
    if not remaining_video_paths:
        logger.info("All required scene-level features already exist. Skipping...")
        progress.complete()
        return

    # Do convert frame-level features into video-level features.
    logger.info("Starting scene-level feature extraction for %s of %s files", len(remaining_video_paths), len(files))
    frame_to_global(remaining_video_paths, pipeline, progress)
    logger.info("Done scene-level feature extraction.")


def missing_scene_features(files, pipeline: PipelineContext):
    """Get file paths with missing video-level features."""
    scene_features = pipeline.repr_storage.scene_level
    for i, file_path in enumerate(files):
        if not scene_features.exists(pipeline.filekey(file_path)):
            yield file_path


def scene_features_exist(files, pipeline: PipelineContext):
    """Check if all required video-level features do exist."""
    return not any(missing_scene_features(files, pipeline))


def frame_to_global(files, pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Calculate and save video-level feature vectors based on frame-level representation."""
    config = pipeline.config
    scene_metadata_path = os.path.join(config.repr.directory, "scene_metadata.csv")
    try:
        # detect_scenes must have been run with config.save_files == True for this to work
        scene_metadata = pd.read_csv(scene_metadata_path)
        scene_durations = []
        for _, row in scene_metadata.iterrows():
            scene_durations += [[row['video_filename'], row['scene_duration_seconds']]]
    except Exception:
        logger.exception("Error loading scene metadata, file '%s' not found" % scene_metadata_path)
        return
    # Seconds per frame
    spf = config.proc.frame_sampling
    progress.scale(len(files))
    for key in map(pipeline.filekey, files):
        try:
            frame_features = pipeline.repr_storage.frame_level.read(key)

            scenes_dur = None
            for filename, durs in scene_durations:
                if filename in key.path:
                    scenes_dur = [int(d) for d in durs.strip('][').split(', ')]
                    break
            if scenes_dur is None:
                raise Exception("Error: no scene metadata available for file '%s'" % key.path)

            scene_features = []
            for dur in scenes_dur:
                scene_frames = dur // spf
                scene_features += [frame_features[:scene_frames]]

            scene_representations = np.concatenate([global_vector(sf) for sf in scene_features])

            pipeline.repr_storage.scene_level.write(key, scene_representations)
        except Exception:
            logger.exception("Error computing video-level features for file: %s", key)
        finally:
            progress.increase(1)
    progress.complete()
