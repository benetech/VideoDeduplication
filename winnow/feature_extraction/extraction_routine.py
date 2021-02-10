import logging
import os
from typing import Callable

import numpy as np
from tqdm import tqdm

from winnow.utils.multiproc import multiprocessing as mp
from .model_tf import CNN_tf
from .utils import load_video

logger = logging.getLogger(__name__)


os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"


def pload_video(p, size, frame_sampling):
    return load_video(p, size, frame_sampling)


def feature_extraction_videos(
    model,
    videos,
    on_extracted: Callable,
    cores=4,
    batch_sz=8,
    frame_sampling=1,
):
    """
    Function that extracts the intermediate CNN features
    of each video in a provided video list.
    Args:
        model: CNN network
        videos: list of video file paths
        on_extracted: a callback receiving (file_path, frames_tensor, frames_features) to handle
            extracted file features which is invoked on each file processing finish
        cores: CPU cores for the parallel video loading
        batch_sz: batch size fed to the CNN network
        frame_sampling: Minimal distance (in sec.) between frames to be saved.
    """
    video_list = {i: video for i, video in enumerate(videos)}

    logger.info("Number of videos: %s", len(video_list))
    logger.info("CPU cores: %s", cores)
    logger.info("Batch size: %s", batch_sz)
    logger.info("Starting Feature Extraction Process")

    pool = mp.Pool(cores)
    future_videos = dict()

    progress_bar = tqdm(range(np.max(list(video_list.keys())) + 1), mininterval=1.0, unit="video")
    for video in progress_bar:

        try:
            video_file_path = video_list[video]
            progress_bar.set_postfix(video=os.path.basename(video_file_path))
            if os.path.exists(video_file_path):

                if video not in future_videos:
                    video_tensor = pload_video(video_file_path, model.desired_size, frame_sampling)

                else:
                    video_tensor = future_videos[video].get()
                    del future_videos[video]

                # load videos in parallel
                for i in range(cores - len(future_videos)):
                    next_video = np.max(list(future_videos.keys())) + 1 if len(future_videos) else video + 1

                    if (
                        next_video in video_list
                        and next_video not in future_videos  # noqa: W503
                        and os.path.exists(video_list[next_video])  # noqa: W503
                    ):
                        future_videos[next_video] = pool.apply_async(
                            pload_video, args=[video_list[next_video], model.desired_size, frame_sampling]
                        )

                # extract features
                features = model.extract(video_tensor, batch_sz)
                on_extracted(video_file_path, video_tensor, features)
        except Exception:
            logger.exception(f"Error processing file:{video_list[video]}")


def load_featurizer(pretrained_local_path):
    """Load pretrained model."""
    return CNN_tf("vgg", pretrained_local_path)
