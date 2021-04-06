import logging
from typing import Collection, Dict
from winnow.feature_extraction import SimilarityModel
from winnow.pipeline.extract_video_level_features import video_features_exist, extract_video_level_features
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.repr_key import ReprKey
from winnow.storage.repr_utils import bulk_read, bulk_write
from winnow.utils.files import get_hash
import multiprocessing as mp

# Default module logger
logger = logging.getLogger(__name__)


def extract_video_signatures(files: Collection[str], pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Calculate and save signatures for the given files to repr-storage."""

    files = tuple(files)
    pool = mp.Pool(mp.cpu_count())
    hashes = pool.map(get_hash, files)
    remaining_video_paths, remaining_hashes = zip(*missing_video_signatures(files, pipeline, hashes))

    # Ensure dependencies are satisfied

    if not video_features_exist(remaining_video_paths, pipeline, remaining_hashes):
        extract_video_level_features(remaining_video_paths, pipeline, remaining_hashes, progress=progress.subtask(0.9))
        progress = progress.subtask(0.1)
    # Skip step if required results already exist
    if not remaining_video_paths:
        logger.info("Representation storage contains all required signatures. Skipping...")
        progress.complete()
        return

    # Do calculate signatures
    logger.info("Starting signature extraction for %s of %s files", len(remaining_video_paths), len(files))
    signatures = extract_signatures(remaining_video_paths, pipeline, remaining_hashes)
    bulk_write(pipeline.repr_storage.signature, signatures)

    logger.info("Done signature extraction.")
    progress.complete()


def missing_video_signatures(files, pipeline: PipelineContext, hashes: Collection[str]):
    """Get file paths with missing signatures."""
    signatures = pipeline.repr_storage.signature

    for i, file_path in enumerate(files):
        if not signatures.exists(pipeline.reprkey(file_path, hash=hashes[i])):
            yield file_path, hashes[i]


def video_signatures_exist(files, pipeline: PipelineContext, hashes: Collection[str]):
    """Check if all required signatures do exist."""
    return not any(missing_video_signatures(files, pipeline, hashes))


def extract_signatures(files, pipeline: PipelineContext, hashes: Collection[str]) -> Dict[ReprKey, Collection[float]]:
    """Do extract signatures for the given video-files."""
    similarity_model = SimilarityModel()
    file_keys = [pipeline.reprkey(file, hash=hashes[i]) for i, file in enumerate(files)]

    video_features = bulk_read(pipeline.repr_storage.video_level, select=file_keys)
    return similarity_model.predict(video_features)
