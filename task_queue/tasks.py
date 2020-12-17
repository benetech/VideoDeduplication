import os
import time
from pathlib import Path

from celery.utils.log import get_task_logger

from .application import celery_application

logger = get_task_logger(__name__)


@celery_application.task
def process_directory(directory, frame_sampling=None, save_frames=None):
    from winnow.utils.config import resolve_config
    from winnow.utils.files import scan_videos
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.extract_features import extract_features
    from winnow.pipeline.generate_matches import generate_matches

    logger.info(
        f"Initiating ProcessDirectory task: directory={directory}, "
        f"frame_sampling={frame_sampling}, save_frames={save_frames}"
    )

    # Load configuration file
    logger.info("Loading config file")
    config = resolve_config(frame_sampling=frame_sampling, save_frames=save_frames)

    # Resolve list of video files from the directory
    logger.info(f"Resolving video list for directory {directory}")
    absolute_path = os.path.abspath(os.path.join(config.sources.root, directory))
    if Path(config.sources.root) not in Path(absolute_path).parents:
        raise ValueError(f"Directory '{directory}' is outside of content root folder '{config.sources.root}'")

    videos = scan_videos(config.sources.root, "**", extensions=config.sources.extensions)

    # Run pipeline
    logger.info("Starting extract-features step...")
    extract_features(config, videos)

    logger.info("Starting generate-matches step...")
    generate_matches(config)

    logger.info("Starting extract-exif step...")
    extract_exif(config)


@celery_application.task
def process_file_list(files, frame_sampling=None, save_frames=None):
    from winnow.utils.config import resolve_config
    from winnow.pipeline.extract_exif import extract_exif
    from winnow.pipeline.extract_features import extract_features
    from winnow.pipeline.generate_matches import generate_matches

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


@celery_application.task
def test_fibonacci(n, delay):
    logger.info(f"Received a test task: n={n}, delay={delay}")
    time.sleep(delay)
    return fibo(n)
