import logging
from math import ceil

from winnow.duplicate_detection.neighbors import NeighborMatcher
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, ProgressBar
from winnow.storage.repr_utils import bulk_read

# Default module logger
logger = logging.getLogger(__name__)


def generate_remote_matches(
    pipeline: PipelineContext,
    repository_name: str = None,
    contributor_name: str = None,
    progress=ProgressMonitor.NULL,
):
    """Find matches between local and remote files."""

    chunk_size = 1000
    config = pipeline.config

    logger.info("Starting remote match detection.")

    # Prepare index of local signatures to detect matches
    local_signatures = bulk_read(pipeline.repr_storage.signature)
    neighbor_matcher = NeighborMatcher(haystack=local_signatures)

    # Acquire remote signature storage
    storage = pipeline.remote_signature_dao

    # Configure progress monitor
    total_work, step_work = _progress(storage, repository_name, contributor_name, chunk_size)
    progress.scale(total_work=total_work)
    progress = ProgressBar(progress)

    # Load remote matches by chunks and do find matches
    for remote_signatures in storage.query_signatures(repository_name, contributor_name, chunk_size=chunk_size):
        matches = neighbor_matcher.find_matches(needles=remote_signatures, max_distance=config.proc.match_distance)
        storage.save_matches(matches)
        progress.increase(amount=step_work)

    logger.info("Done remote match detection.")
    progress.complete()


def _progress(remote_signatures_storage, repository_name, contributor_name, chunk_size):
    """Get total work and step work to account all available remote fingerprints."""
    total_count = remote_signatures_storage.count(
        repository_name=repository_name,
        contributor_name=contributor_name,
    )
    if total_count is None:
        return 1.0, 0
    iterations = ceil(max(total_count, 1) / float(chunk_size))
    return iterations, 1
