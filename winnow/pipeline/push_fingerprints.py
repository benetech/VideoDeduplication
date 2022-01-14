import logging

from remote import make_client
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor

# Default module logger
logger = logging.getLogger(__name__)


def push_fingerprints(repository_name: str, pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Push fingerprints to the remote repository."""

    # Get repository
    repo = pipeline.repository_dao.get(repository_name)
    if repo is None:
        logger.error("Unknown repository name: %s", repository_name)
        progress.complete()
        return

    progress.scale(total_work=1.0)
    connector = pipeline.make_connector(repo)
    logger.info("Pushing fingerprints to %s", repository_name)
    try:
        connector.push_all(chunk_size=10000, progress=progress.subtask(1.0))
        logger.info("Finished pushing fingerprints to %s", repository_name)
    except Exception:
        logger.exception("Error pushing fingerprints to %s", repository_name)
        raise
    finally:
        # Update repo metadata
        logger.info("Updating '%s' repository metadata", repository_name)
        client = make_client(repo)
        repo_stats = client.get_stats()
        pipeline.repository_dao.update_stats(repo_stats)
        progress.complete()
