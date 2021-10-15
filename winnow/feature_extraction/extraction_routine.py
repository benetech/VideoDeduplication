import logging
import os
from typing import Callable

from tqdm import tqdm
import time

from winnow.utils.multiproc import multiprocessing as mp
from .model_tf import CNN_tf
from .utils import load_video

logger = logging.getLogger(__name__)


os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"


def pload_video(p, size, frame_sampling):
    return p, load_video(p, size, frame_sampling)


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

    unprocessed_videos = [v for v in videos]
    future_videos = {}
    processed_videos = []
    progress_bar = tqdm(range(len(videos)), mininterval=1.0, unit="video").__iter__()

    # Make sure proper number of video loading threads are going
    def fill_cores():
        nonlocal unprocessed_videos, future_videos, progress_bar
        while len(future_videos) < cores:
            if len(unprocessed_videos) > 0:
                next_video_path = unprocessed_videos[0]
                unprocessed_videos = unprocessed_videos[1:]
                if os.path.exists(next_video_path):
                    future_videos[next_video_path] = pool.apply_async(
                        pload_video,
                        args=[next_video_path, model.desired_size, frame_sampling],
                        callback=update_callback,
                    )
                else:
                    # Handling UI behavior when a video is skipped for not existing
                    next(progress_bar)
                    # postfix removed so progress_bar could be an iterator:
                    # progress_bar.set_postfix(video=os.path.basename(next_video_path))
            else:
                break

    # Called when a video is done loading
    # Note: nonlocal object safety is guaranteed because the callback is run on one result at a time, never in parallel
    def update_callback(result):
        nonlocal future_videos, processed_videos, progress_bar
        # Get path and tensor
        video_file_path, video_tensor = result
        next(progress_bar)
        # postfix removed so progress_bar could be an iterator:
        # progress_bar.set_postfix(video=os.path.basename(video_file_path))

        try:
            # start loading new video
            del future_videos[video_file_path]
            fill_cores()

            # extract features
            features = model.extract(video_tensor, batch_sz)
            on_extracted(video_file_path, video_tensor, features)
            processed_videos += [video_file_path]
        except Exception:
            logger.exception(f"Error processing file:{video_file_path}")

    # Start loading + processing
    fill_cores()
    # wait until all data processing is done, checking at 1-second intervals
    while len(processed_videos) < len(videos):
        time.sleep(1)


def load_featurizer(pretrained_local_path):
    """Load pretrained model."""
    return CNN_tf("vgg", pretrained_local_path)
