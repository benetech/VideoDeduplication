import logging
import os
from typing import Collection

import pandas as pd
from dataclasses import asdict
from sqlalchemy import tuple_

from db.schema import Files
from winnow.pipeline.extract_frame_level_features import frame_features_exist, extract_frame_level_features
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.utils.files import get_hash
from winnow.utils.iterators import chunks
from winnow.utils.scene_detection import extract_scenes

# Default module logger
logger = logging.getLogger(__name__)


def detect_scenes(files: Collection[str], pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Detect scenes for the given files."""

    files = tuple(files)
    remaining_video_paths = tuple(missing_scenes(files, pipeline))

    # Ensure dependencies are satisfied
    if not frame_features_exist(remaining_video_paths, pipeline):
        extract_frame_level_features(remaining_video_paths, pipeline, progress=progress.subtask(0.9))
        progress = progress.subtask(0.1)

    # Skip step if required results already exist
    if not remaining_video_paths:
        logger.info("Scene detection is not required. Skipping...")
        progress.complete()
        return

    logger.info("Starting scene detection for %s of %s files", len(remaining_video_paths), len(files))

    config = pipeline.config
    frame_features = pipeline.repr_storage.frame_level
    file_keys = tuple(map(pipeline.filekey, remaining_video_paths))

    # Do extract scenes
    scenes = extract_scenes(file_keys, frame_features, min_scene_duration=config.proc.minimum_scene_duration)
    scene_metadata = pd.DataFrame(asdict(scenes))

    if config.database.use:
        result_storage = pipeline.result_storage
        result_storage.add_scenes(zip(scenes.video_filename, scenes.video_sha256, scenes.scene_duration_seconds))

    if config.save_files:
        scene_metadata_output_path = os.path.join(config.repr.directory, "scene_metadata.csv")
        scene_metadata.to_csv(scene_metadata_output_path)
        logger.info("Scene Metadata saved in: %s", scene_metadata_output_path)

    logger.info("Done scene detection.")
    progress.complete()


def scenes_exist(files, pipeline: PipelineContext):
    """Check if there are files with missing scenes."""
    return not any(missing_scenes(files, pipeline, yield_per=1))


def missing_scenes(files, pipeline: PipelineContext, yield_per=100):
    """Select files with missing scenes."""
    # If scenes should not be extracted, then requirement is satisfied for all files
    if not pipeline.config.proc.detect_scenes:
        return
    # If scenes should be saved to file, then extract scenes for all files
    if pipeline.config.save_files:
        yield from files
        return
    # If scenes should not be saved, then requirement is satisfied for all files
    if not pipeline.config.database.use:
        return
    # Otherwise requirement is not satisfied iff there is a database entries with missing scenes
    with pipeline.database.session_scope() as session:
        for chunk in chunks(files, size=100):
            query = _query_files_with_missing_scenes(chunk, session, pipeline).yield_per(yield_per)
            for file in query:
                yield os.path.join(pipeline.config.sources.root, file.file_path)


def _query_files_with_missing_scenes(files, session, pipeline: PipelineContext):
    """Create a database query for files with missing scenes."""
    hash_mode = pipeline.config.repr.hash_mode
    hashes = map(lambda path: get_hash(path, hash_mode), files)
    store_paths = map(pipeline.storepath, files)
    path_hash_pairs = tuple(zip(store_paths, hashes))
    query = session.query(Files).filter(Files.contributor == None)  # noqa: E711
    query = query.filter(tuple_(Files.file_path, Files.sha256).in_(path_hash_pairs))
    query = query.filter(~Files.scenes.any())
    return query
