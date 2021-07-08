import logging
import os
from pickle import dumps
from typing import Collection, Tuple

from dataclasses import astuple

from db.access.files import FilesDAO
from winnow.pipeline.extract_video_signatures import extract_video_signatures, video_signatures_exist
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.legacy.repr_key import ReprKey
from winnow.storage.repr_utils import bulk_read

logger = logging.getLogger(__name__)


def store_database_signatures(files: Collection[str], pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Ensure result database contains signatures for all given files."""

    if not pipeline.config.database.use:
        logger.info("Database is disabled. Skipping database signatures update...")
        progress.complete()
        return

    files = tuple(files)
    remaining_video_paths = tuple(missing_database_signatures(files, pipeline))

    # Ensure dependencies are satisfied
    if not video_signatures_exist(remaining_video_paths, pipeline):
        extract_video_signatures(remaining_video_paths, pipeline, progress=progress.subtask(0.9))
        progress = progress.subtask(0.1)

    # Skip step if required results already exist
    if not remaining_video_paths:
        logger.info("Database contains all required signatures. Skipping...")
        progress.complete()
        return

    # Save signatures to database if needed
    logger.info("Saving signatures to the database for %s of %s files", len(remaining_video_paths), len(files))
    file_keys = map(pipeline.filekey, remaining_video_paths)
    signatures = bulk_read(pipeline.repr_storage.signature, select=file_keys)
    pipeline.result_storage.add_signatures((key.path, key.hash, dumps(sig)) for key, sig in signatures.items())

    logger.info("Done saving %s signatures to database.", len(remaining_video_paths))
    progress.complete()


def missing_database_signatures(files, pipeline: PipelineContext):
    """Get file paths with missing signatures."""

    if not pipeline.config.database.use:
        return

    with pipeline.database.session_scope() as session:
        file_keys = map(pipeline.filekey, files)
        path_hash_pairs = map(astuple, file_keys)
        for (path, _) in FilesDAO.select_missing_signatures(path_hash_pairs, session):
            yield os.path.join(pipeline.config.sources.root, path)


def database_signatures_exist(files, pipeline: PipelineContext):
    """Check if all required signatures do exist."""
    return not any(missing_database_signatures(files, pipeline))
