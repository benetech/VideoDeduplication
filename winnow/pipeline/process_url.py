import logging

from winnow.pipeline.detect_scenes import detect_scenes
from winnow.pipeline.download_video_url import download_video_url
from winnow.pipeline.generate_local_matches import generate_local_matches
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor


def process_url(
    video_url: str,
    pipeline: PipelineContext,
    destination="%(title)s.%(ext)s",
    progress=ProgressMonitor.NULL,
):
    """Process single file url."""

    logger = logging.getLogger(__name__)
    logger.info("Processing video by URL: %s", video_url)

    progress.scale(1.0)
    file_path = download_video_url(video_url, pipeline, destination, progress=progress.subtask(0.2))
    generate_local_matches(files=[file_path], pipeline=pipeline)
    detect_scenes(files=[file_path], pipeline=pipeline)
