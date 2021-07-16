import logging

from winnow.pipeline.detect_scenes import detect_scenes
from winnow.pipeline.extract_exif import extract_exif
from winnow.pipeline.generate_local_matches import generate_local_matches
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.utils.download import download_videos


def process_urls(
    urls: str,
    pipeline: PipelineContext,
    destination_template: str = "%(title)s.%(ext)s",
    progress=ProgressMonitor.NULL,
):
    """Process single file url."""

    logger = logging.getLogger(__name__)
    logger.info("Processing %s video URLs", len(urls))

    progress.scale(1.0)
    file_paths = download_videos(
        urls=urls,
        root_directory=pipeline.config.sources.root,
        output_template=destination_template,
        progress=progress.subtask(0.2),
        logger=logger,
        suppress_errors=True,
    )

    generate_local_matches(files=file_paths, pipeline=pipeline, progress=progress.subtask(0.7))
    detect_scenes(files=file_paths, pipeline=pipeline, progress=progress.subtask(0.05))
    extract_exif(videos=file_paths, pipeline=pipeline, progress_monitor=progress.subtask(0.05))

    return file_paths
