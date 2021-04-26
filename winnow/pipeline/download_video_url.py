import logging
import os
import sys
from contextlib import contextmanager
from pathlib import Path

import youtube_dl
from tqdm import tqdm

from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor


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


class YDLProgressTracker:
    """Track the progress of YouTube-DL download."""

    def __init__(self, show_progress_bar=True):
        self._progress: BaseProgressMonitor = None
        self._started = False
        self._tqdm: tqdm = None
        self._total_bytes = None
        self._downloaded_bytes = 0
        self.show_progress_bar = show_progress_bar

    def _prepare(self, progress: BaseProgressMonitor):
        """Initialize tracker attributes before download."""
        self._started = True
        self._total_bytes = None
        self._downloaded_bytes = 0
        self._progress = progress
        if self.show_progress_bar:
            self._tqdm = tqdm(total=None, unit="bytes", dynamic_ncols=True, file=sys.stdout)
        else:
            self._tqdm = None

    def _is_first_report(self):
        """Detect first report."""
        return self._total_bytes is None

    def _handle_start(self, data):
        """Handle downloading started."""
        self._total_bytes = data["total_bytes"]
        self._progress.scale(total_work=self._total_bytes)
        if self._tqdm is not None:
            self._tqdm.total = self._total_bytes

    def _handle_progress(self, data):
        """Handle downloading progress."""
        # Get progress in bytes
        downloaded_bytes = data.get("downloaded_bytes", 0)
        progress_bytes = max(0, downloaded_bytes - self._downloaded_bytes)
        self._downloaded_bytes = downloaded_bytes

        # Report progress
        self._progress.increase(amount=progress_bytes)
        if self._tqdm is not None:
            self._tqdm.update(progress_bytes)

    def _handle_finish(self):
        """Handle download finish."""
        self._progress.complete()
        if self._tqdm is not None:
            self._tqdm.update(max(0, self._total_bytes - self._downloaded_bytes))
            self._tqdm.close()

    def hook(self, data):
        """YouTube-DL progress hook."""
        if not self._started:
            return
        if self._is_first_report():
            self._handle_start(data)
        status = data.get("status")
        if status == "downloading":
            self._handle_progress(data)
        elif status == "finished":
            self._handle_finish()

    @contextmanager
    def track(self, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Track download progress."""
        self._prepare(progress)
        try:
            yield self
        finally:
            self._started = False


def download_video_url(
    video_url: str,
    pipeline: PipelineContext,
    destination="%(title)s.%(ext)s",
    progress=ProgressMonitor.NULL,
):
    """Download a single video from the ."""

    config = pipeline.config
    logger = logging.getLogger(__name__)
    logger.info("Starting video download from URL: %s", video_url)

    # Setup progress-tracking
    progress.scale(total_work=1.0)
    progress_tracker = YDLProgressTracker(show_progress_bar=True)

    # Resolve destination path template
    output_template = complete_template(config.sources.root, destination)
    logger.info("Output template: %s", output_template)

    ydl_opts = {
        "format": "mp4",
        "logger": YDLLogger(logger),
        "progress_hooks": [progress_tracker.hook],
        "outtmpl": output_template,
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        # Determine destination file name
        video_info = ydl.extract_info(video_url, download=False)
        file_name = ydl.prepare_filename(video_info)
        logger.info("Downloading file: %s", file_name)

        # Download file
        with progress_tracker.track(progress):
            ydl.download([video_url])

    progress.complete()
    return file_name


def complete_template(dataset_directory: str, template: str) -> str:
    """Complete the destination template."""
    dataset_directory = os.path.abspath(dataset_directory)
    result = os.path.normpath(os.path.join(dataset_directory, template))
    if Path(dataset_directory) not in Path(result).parents:
        raise ValueError(f"Template '{template}' points outside of the dataset dataset directory.")
    return result
