import logging
from math import ceil
from typing import Iterable, List, Dict

from winnow.duplicate_detection.neighbors import NeighborMatcher, FeatureVector, DetectedMatch
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, ProgressBar
from winnow.remote.model import RemoteFingerprint
from winnow.storage.remote_signatures_dao import RemoteMatch
from winnow.storage.repr_utils import bulk_read
from winnow.utils.iterators import chunks

# Default module logger
from winnow.utils.neighbors import as_vectors

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
    neighbor_matcher = NeighborMatcher(haystack=as_vectors(local_signatures), metric=config.proc.metric)

    # Acquire remote signature storage
    storage = pipeline.remote_signature_dao

    # Configure progress monitor
    total_work, step_work = _progress(storage, repository_name, contributor_name, chunk_size)
    progress.scale(total_work=total_work)
    progress = ProgressBar(progress)

    # Load remote matches by chunks and do find matches
    for remote_signatures in chunks(storage.query_signatures(repository_name, contributor_name), size=chunk_size):
        remote_index = {remote.id: remote for remote in remote_signatures}
        needles = (FeatureVector(key=remote.id, features=remote.fingerprint) for remote in remote_signatures)
        detected_matches = neighbor_matcher.find_matches(needles=needles, max_distance=config.proc.match_distance)
        storage.save_matches(remote_matches(detected_matches, remote_index))
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


def remote_matches(
    detected_matches: Iterable[DetectedMatch],
    remote_sigs: Dict[int, RemoteFingerprint],
) -> List[RemoteMatch]:
    """Convert detected feature-vector matches to remote matches."""
    results = []
    for detected_match in detected_matches:
        remote_match = RemoteMatch(
            remote=remote_sigs[detected_match.needle_key],
            local=detected_match.haystack_key,
            distance=detected_match.distance,
        )
        results.append(remote_match)
    return results
