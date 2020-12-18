import logging
import os
import time
from pathlib import Path

from celery import states
from celery.utils.log import get_task_logger

from .application import celery_application

logger = get_task_logger(__name__)


@celery_application.task(bind=True)
def process_directory(self, directory, frame_sampling=None, save_frames=None):
    # Mark task as started
    self.update_state(state=states.STARTED, meta={})

    from winnow.utils.config import resolve_config
    from winnow.utils.files import scan_videos
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.extract_features import extract_features
    from winnow.pipeline.generate_matches import generate_matches

    # Setup winnow logging
    logging.getLogger("winnow").setLevel(logging.INFO)

    logger.info(
        f"Initiating ProcessDirectory task: directory={directory}, "
        f"frame_sampling={frame_sampling}, save_frames={save_frames}"
    )

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
    logger.info("Starting extract-features step...")
    extract_features(config, videos)

    logger.info("Starting generate-matches step...")
    generate_matches(config)

    logger.info("Starting extract-exif step...")
    extract_exif(config)


@celery_application.task(bind=True)
def process_file_list(self, files, frame_sampling=None, save_frames=None):
    # Mark task as started
    self.update_state(state=states.STARTED, meta={})

    from winnow.utils.config import resolve_config
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.extract_features import extract_features
    from winnow.pipeline.generate_matches import generate_matches

    # Setup winnow logging
    logging.getLogger("winnow").setLevel(logging.INFO)

    logger.info(
        f"Initiating ProcessFileList task: len(files)={len(files)}, "
        f"frame_sampling={frame_sampling}, save_frames={save_frames}"
    )

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(frame_sampling=frame_sampling, save_frames=save_frames)

    # Run pipeline
    logger.info("Starting extract-features step...")
    extract_features(config, files)

    logger.info("Starting generate-matches step...")
    generate_matches(config)

    logger.info("Starting extract-exif step...")
    extract_exif(config)


def fibo(n):
    """A very inefficient Fibonacci numbers generator."""
    if n <= 2:
        return 1
    return fibo(n - 1) + fibo(n - 2)


@celery_application.task(bind=True)
def test_fibonacci(self, n, delay):
    # Mark task as started
    self.update_state(state=states.STARTED, meta={})

    logger.info(f"Received a test task: n={n}, delay={delay}")
    time.sleep(delay)
    return fibo(n)
