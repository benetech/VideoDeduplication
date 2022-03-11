import logging
import os
from itertools import repeat
from typing import Callable, Any, Collection, Tuple

import numpy as np
from tqdm import tqdm

from winnow.utils.multiproc import multiprocessing as mp
from .model_tf import CNN_tf
from .utils import load_video

logger = logging.getLogger(__name__)


os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"


def process_video(task: Tuple[str, Any, CNN_tf, int, int]) -> Tuple[Any, np.ndarray, np.ndarray]:
    """Process a single video.

    Takes a tuple (video_path, video_id, model, frame_sampling, batch_size).
    Returns a tuple (video_id, frames_tensor, frame_features)
    """
    video_path, video_id, model, frame_sampling, batch_sz = task
    frames_tensor = load_video(video_path, model.desired_size, frame_sampling)
    frame_features = model.extract(frames_tensor, batch_sz)
    return video_id, frames_tensor, frame_features


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
    """
    video_list = {i: video for i, video in enumerate(video_paths)}

    logger.info("Number of videos: %s", len(video_list))
    logger.info("CPU cores: %s", cores)
    logger.info("Batch size: %s", batch_sz)
    logger.info("Starting Feature Extraction Process")

    pool = mp.Pool(cores)

    file_count = len(video_paths)
    tasks = zip(
        video_paths,
        video_ids,
        repeat(model, file_count),
        repeat(frame_sampling, file_count),
        repeat(batch_sz, file_count),
    )

    progress_bar = iter(tqdm(range(file_count), mininterval=1.0, unit="video"))
    for video, frames, features in pool.imap_unordered(process_video, tasks):
        on_extracted(video, frames, features)
        next(progress_bar)


def load_featurizer(pretrained_local_path) -> CNN_tf:
    """Load pretrained model."""
    return CNN_tf("vgg", pretrained_local_path)
