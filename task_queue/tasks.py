import os
import time
from pathlib import Path

from celery.utils.log import get_task_logger

from .progress_monitor import make_progress_monitor
from .winnow_task import winnow_task

logger = get_task_logger(__name__)


@winnow_task(bind=True)
def process_directory(self, directory, frame_sampling=None, save_frames=None):
    from winnow.utils.config import resolve_config
    from winnow.utils.files import scan_videos
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.detect_scenes import detect_scenes
    from winnow.pipeline.generate_local_matches import generate_local_matches
    from winnow.pipeline.pipeline_context import PipelineContext

    # Initialize a progress monitor
    monitor = make_progress_monitor(task=self, total_work=1.0)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(frame_sampling=frame_sampling, save_frames=save_frames)

    # Resolve list of video files from the directory
    logger.info(f"Resolving video list for directory {directory}")
    absolute_root = os.path.abspath(config.sources.root)
    absolute_dir = os.path.abspath(os.path.join(absolute_root, directory))
    if Path(config.sources.root) not in Path(absolute_dir).parents and absolute_root != absolute_dir:
        raise ValueError(f"Directory '{directory}' is outside of content root folder '{config.sources.root}'")

    videos = scan_videos(absolute_dir, "**", extensions=config.sources.extensions)

    # Run pipeline
    monitor.update(0)
    pipeline_context = PipelineContext(config)
    generate_local_matches(files=videos, pipeline=pipeline_context, progress=monitor.subtask(work_amount=0.9))
    detect_scenes(files=videos, pipeline=pipeline_context, progress=monitor.subtask(0.01))
    extract_exif(config, progress_monitor=monitor.subtask(work_amount=0.05))

    monitor.complete()


@winnow_task(bind=True)
def process_file_list(self, files, frame_sampling=None, save_frames=None):
    from winnow.utils.config import resolve_config
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.detect_scenes import detect_scenes
    from winnow.pipeline.generate_local_matches import generate_local_matches
    from winnow.pipeline.pipeline_context import PipelineContext

    # Initialize a progress monitor
    monitor = make_progress_monitor(task=self, total_work=1.0)

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(frame_sampling=frame_sampling, save_frames=save_frames)

    # Run pipeline
    monitor.update(0)
    pipeline_context = PipelineContext(config)
    generate_local_matches(files, pipeline=pipeline_context, progress=monitor.subtask(work_amount=0.9))
    detect_scenes(files, pipeline=pipeline_context, progress=monitor.subtask(0.01))
    extract_exif(config, progress_monitor=monitor.subtask(work_amount=0.05))

    monitor.complete()


def fibo(n):
    """A very inefficient Fibonacci numbers generator."""
    if n <= 2:
        return 1
    return fibo(n - 1) + fibo(n - 2)


@winnow_task(bind=True)
def test_fibonacci(self, n, delay):
    # Initialize a progress monitor
    monitor = make_progress_monitor(task=self, total_work=n)
    for step in range(n):
        time.sleep(delay)
        logger.info(f"Step #{step} of {n}")
        monitor.increase(1)
