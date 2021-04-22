import logging
import os
from pathlib import Path

import youtube_dl
from tqdm import tqdm

from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor


class YDLLogger(object):
    """Funnel YouTube-DL logs to the dedicated logger."""

    def __init__(self, logger):
        self.logger = logger

    def debug(self, msg):
        self.logger.debug(msg)

    def warning(self, msg):
        self.logger.warning(msg)

    def error(self, msg):
        self.logger.error(msg)


def download_video_url(
    video_url: str,
    pipeline: PipelineContext,
    destination="%(title)s.%(ext)s",
    progress=ProgressMonitor.NULL,
):
    """Download a single video from the ."""

    config = pipeline.config
    logger = logging.getLogger(__name__)

    logger.info("Starting video download: %s", video_url)

    with tqdm(total=None, unit="bytes", dynamic_ncols=True) as progress_bar:

        def progress_hook(data):
            """Track downloading progress."""
            if progress_bar.total is None:
                progress_bar.total = data["total_bytes"]
                progress.scale(total_work=data["total_bytes"])
            progress_bar.update(data["downloaded_bytes"])
            progress.increase(amount=data["downloaded_bytes"])
            if data["status"] == "finished":
                progress.complete()

        ydl_opts = {
            "format": "bestaudio/best",
            "logger": YDLLogger(logger),
            "progress_hooks": [progress_hook],
            "outtmpl": complete_template(config.sources.root, destination),
        }

        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])


def complete_template(dataset_directory: str, template: str) -> str:
    """Complete the destination template."""
    dataset_directory = os.path.abspath(dataset_directory)
    result = os.path.normpath(os.path.join(dataset_directory, template))
    if Path(dataset_directory) not in Path(result).parents:
        raise ValueError(f"Template '{template}' points outside of the dataset dataset directory.")
    return result
