import os
from multiprocessing import Pool

import numpy as np
from tqdm import tqdm

from .model_tf import CNN_tf
from .utils import load_video, download_pretrained
from ..utils import get_hash

package_directory = os.path.dirname(os.path.abspath(__file__))
os.environ['WINNOW_CONFIG'] = os.path.abspath('config.yaml')

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'


PRETRAINED_LOCAL_PATH = download_pretrained(os.environ['WINNOW_CONFIG'])


def pload_video(p, size, frame_sampling):
    return load_video(p, size, frame_sampling)


def feature_extraction_videos(model, cores, batch_sz, video_list, reprs, storepath, frame_sampling, save_frames):
    """
    Function that extracts the intermediate CNN features
    of each video in a provided video list.
    Args:
        model: CNN network
        cores: CPU cores for the parallel video loading
        batch_sz: batch size fed to the CNN network
        video_list: list of video to extract features
        reprs (winnow.storage.repr_storage.ReprStorage): storage of video features
        storepath: convert paths to relative paths inside content root folder
        frame_sampling: Minimal distance (in sec.) between frames to be saved.
        save_frames: Save normalized video frames.
    """
    video_list = {i: video.strip() for i, video in enumerate(open(video_list, encoding="utf-8").readlines())}
    print('\nNumber of videos: ', len(video_list))
    print('Storage directory: ', reprs)
    print('CPU cores: ', cores)
    print('Batch size: ', batch_sz)

    print('\nFeature Extraction Process')
    print('==========================')
        
    pool = Pool(cores)
    future_videos = dict()
    output_list = []

    pbar = tqdm(range(np.max(list(video_list.keys()))+1), mininterval=1.0, unit='video')
    for video in pbar:
        video_file_path = video_list[video]
        pbar.set_postfix(video=os.path.basename(video_file_path))
        if os.path.exists(video_file_path):
            
            if video not in future_videos:
                video_tensor = pload_video(video_file_path, model.desired_size, frame_sampling)
            else:
                video_tensor = future_videos[video].get()
                del future_videos[video]

            # load videos in parallel
            for i in range(cores - len(future_videos)):
                next_video = np.max(list(future_videos.keys())) + 1 \
                    if len(future_videos) else video + 1

                if next_video in video_list and \
                    next_video not in future_videos and \
                        os.path.exists(video_list[next_video]):
                    future_videos[next_video] = pool.apply_async(pload_video,
                        args=[video_list[next_video], model.desired_size,frame_sampling])

            # extract features
            features = model.extract(video_tensor, batch_sz)

            # save features
            storage_path, sha256 = storepath(video_file_path), get_hash(video_file_path)
            reprs.frame_level.write(storage_path, sha256, features)
            if save_frames:
                reprs.frames.write(storage_path, sha256, video_tensor)


def start_video_extraction(video_list, reprs, storepath, cores=4, batch_sz=8, frame_sampling=1, save_frames=False):
    model = CNN_tf('vgg', PRETRAINED_LOCAL_PATH)

    feature_extraction_videos(model, cores, batch_sz, video_list, reprs, storepath, frame_sampling, save_frames)

def load_featurizer(PRETRAINED_LOCAL_PATH):
    
    model = CNN_tf('vgg', PRETRAINED_LOCAL_PATH)
    
    return  model