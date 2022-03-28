import logging
import os
from itertools import repeat
from typing import Callable, Any, Collection, Tuple

import numpy as np
import tensorflow as tf
from tqdm import tqdm

from winnow.utils.multiproc import multiprocessing as mp
from .model_tf import CNN_tf
from .utils import load_video

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"


def process_video(task: Tuple[str, Any, Any, int, int]) -> Tuple[Any, np.ndarray]:
    """Process a single video.

    Takes a tuple (video_path, video_id, model, frame_sampling, batch_size).
    Returns a tuple (video_id, frames_tensor, frame_features)
    """
    logger = logging.getLogger(f"{__name__}.process_video")
    video_path, video_id, image_size, frame_sampling, batch_sz = task
    logger.info("Preparing frames for %s", video_path)
    frames_tensor = load_video(video_path, image_size, frame_sampling)
    logger.info("Done preparing frames for %s", video_path)
    return video_id, frames_tensor


# Type hint for a function tha will be called when a particular
# file is processed: callback(path_or_id, frames, frame_features)
OnExtractedCallback = Callable[[Any, np.ndarray, np.ndarray], Any]


def feature_extraction_videos(
    model,
    video_paths: Collection[str],
    video_ids: Collection[Any],
    on_extracted: OnExtractedCallback,
    cores: int = 4,
    batch_sz: int = 8,
    frame_sampling: int = 1,
    logger: logging.Logger = logging.getLogger(f"{__name__}.feature_extraction_videos"),
):
    """
    Function that extracts the intermediate CNN features
    of each video in a provided video list.
    Args:
        model: CNN network
        video_paths: list of video file paths
        video_ids: list of video ids (must be of the same size as video paths).
        on_extracted: a callback receiving (file_path, frames_tensor, frames_features) to handle
            extracted file features which is invoked on each file processing finish
        cores: CPU cores for the parallel video loading
        batch_sz: batch size fed to the CNN network
        frame_sampling: Minimal distance (in sec.) between frames to be saved.
        logger: logger to be used.
    """
    file_count = len(video_paths)
    logger.info("Number of videos: %s", file_count)
    logger.info("CPU cores: %s", cores)
    logger.info("Batch size: %s", batch_sz)
    logger.info("Starting Feature Extraction Process")
    logger.info("GPU is available: %s", tf.test.is_gpu_available())

    pool = mp.Pool(cores)
    tasks = zip(
        video_paths,
        video_ids,
        repeat(model.desired_size, file_count),
        repeat(frame_sampling, file_count),
        repeat(batch_sz, file_count),
    )

    progress_bar = iter(tqdm(range(file_count), mininterval=1.0, unit="video"))
    for video_id, frame_tensor in pool.imap_unordered(process_video, tasks, chunksize=1):
        logger.info("Extracting features for %s", video_id)
        frame_features = model.extract(frame_tensor, batch_sz)
        on_extracted(video_id, frame_tensor, frame_features)
        next(progress_bar)


def load_featurizer(pretrained_local_path) -> CNN_tf:
    """Load pretrained model."""
    return CNN_tf("vgg", pretrained_local_path)
