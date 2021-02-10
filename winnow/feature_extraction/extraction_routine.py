import logging
import os

import numpy as np
from tqdm import tqdm

from winnow.utils.multiproc import multiprocessing as mp
from .model_tf import CNN_tf
from .utils import load_video
from ..pipeline.progress_monitor import ProgressMonitor

logger = logging.getLogger(__name__)


os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"


def pload_video(p, size, frame_sampling):
    return load_video(p, size, frame_sampling)


def feature_extraction_videos(
    model,
    video_list,
    reprs,
    reprkey,
    cores=4,
    batch_sz=8,
    frame_sampling=1,
    save_frames=False,
    progress_monitor=ProgressMonitor.NULL,
):
    """
    Function that extracts the intermediate CNN features
    of each video in a provided video list.
    Args:
        model: CNN network
        cores: CPU cores for the parallel video loading
        batch_sz: batch size fed to the CNN network
        video_list: list of video to extract features
        reprs (winnow.storage.repr_storage.ReprStorage): storage of
        video features
        reprkey: function to convert video file paths to representation
        storage key.
        frame_sampling: Minimal distance (in sec.) between frames to be saved.
        save_frames: Save normalized video frames.
        progress_monitor (ProgressMonitor): a progress monitor for feature extraction routine.
    """
    video_list = {i: video.strip() for i, video in enumerate(open(video_list, encoding="utf-8").readlines())}

    logger.info("Number of videos: %s", len(video_list))
    logger.info("Storage directory: %s", reprs)
    logger.info("CPU cores: %s", cores)
    logger.info("Batch size: %s", batch_sz)
    logger.info("Starting Feature Extraction Process")

    pool = mp.Pool(cores)
    future_videos = dict()

    progress_monitor.scale(total_work=len(video_list))
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

                # save features
                key = reprkey(video_file_path)
                reprs.frame_level.write(key, features)
                if save_frames:
                    reprs.frames.write(key, video_tensor)
        except Exception:
            logger.exception(f"Error processing file:{video_list[video]}")
        finally:
            progress_monitor.increase(1)
    progress_monitor.complete()


def load_featurizer(pretrained_local_path):
    """Load pretrained model."""
    return CNN_tf("vgg", pretrained_local_path)
