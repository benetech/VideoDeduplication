

import os
import argparse
import numpy as np

from multiprocessing import Pool
from .utils import load_video, load_image
from .model_tf import CNN_tf
import os
import requests
import shutil
import multiprocessing
from tqdm import tqdm


def download_file(local_filename,url):
    # local_filename = url.split('/')[-1]
    r = requests.get(url, stream=True)
    with open(local_filename, 'wb') as f:
        shutil.copyfileobj(r.raw, f)
    return local_filename
    
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
package_directory = os.path.dirname(os.path.abspath(__file__))
PRETRAINED_MODEL = 'vgg_16.ckpt'
PRETRAINED_MODEL_PATH = os.path.join(package_directory,'pretrained_models',PRETRAINED_MODEL)

if os.path.exists(PRETRAINED_MODEL_PATH):
    print('Pretrained Model Found')
    
else:
    
    try:
        os.makedirs(os.path.join(package_directory,'pretrained_models'))
    except Exception as e:
        print(e)
        pass
    print('Downloading pretrained model to:{}'.format(PRETRAINED_MODEL_PATH))
    download_file(PRETRAINED_MODEL_PATH,"https://s3.amazonaws.com/winnowpretrainedmodels/vgg_16.ckpt")
     


def pload_video(p,size):
	return load_video(p,size)
def feature_extraction_videos(model, cores, batch_sz, video_list, output_path):
    """
      Function that extracts the intermediate CNN features
      of each video in a provided video list.

      Args:
        model: CNN network
        cores: CPU cores for the parallel video loading
        batch_sz: batch size fed to the CNN network
        video_list: list of video to extract features
        output_path: path to store video features
    """
    video_list = {i: video.strip() for i, video in enumerate(open(video_list).readlines())}
    print('\nNumber of videos: ', len(video_list))
    print('Storage directory: ', output_path)
    print('CPU cores: ', cores)
    print('Batch size: ', batch_sz)

    print('\nFeature Extraction Process')
    print('==========================')
        
    pool = Pool(cores)
    future_videos = dict()
    output_list = []

    pbar = tqdm(range(np.max(list(video_list.keys()))+1), mininterval=1.0, unit='video')
    for video in pbar:
        if os.path.exists(video_list[video]):
            video_name = os.path.splitext(os.path.basename(video_list[video]))[0]
            if video not in future_videos:
                video_tensor = pload_video(video_list[video], model.desired_size)
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
                        args=[video_list[next_video], model.desired_size])

            # extract features
            features = model.extract(video_tensor, batch_sz)

            path = os.path.join(output_path, '{}_{}_features'.format(video_name, model.net_name))
            frame_path = os.path.join(output_path, '{}_{}_frames'.format(video_name, model.net_name))
            output_list += ['{}\t{}'.format(video_name, path)]
            pbar.set_postfix(video=video_name)

            # save features
            np.save(path, features)
            np.save(frame_path, video_tensor)
    np.savetxt('{}/video_feature_list.txt'.format(output_path), output_list, fmt='%s')


def start_video_extraction(video_list,output_path,cores = 4,batch_sz=8):

    model = CNN_tf('vgg', PRETRAINED_MODEL_PATH)

    feature_extraction_videos(model, cores, batch_sz, video_list, output_path)

def load_featurizer():
    
    model = CNN_tf('vgg', PRETRAINED_MODEL_PATH)
    
    return  model