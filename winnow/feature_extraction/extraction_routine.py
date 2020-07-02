import os
import argparse
import numpy as np
from multiprocessing import Pool
from .utils import load_video, load_image, download_file
from .model_tf import CNN_tf
import os
import requests
import shutil
import multiprocessing
from tqdm import tqdm
import yaml

package_directory = os.path.dirname(os.path.abspath(__file__))
    
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
hit_exc = False
try:

    CONFIG_FP = os.environ['WINNOW_CONFIG']
    with open(CONFIG_FP,'r') as ymlfile:
        cfg=yaml.load(ymlfile)

    USE_LOCAL_PRETRAINED = cfg['use_pretrained_model_local_path']
    PRETRAINED_LOCAL_PATH = cfg['pretrained_model_local_path']

except Exception as e:
    hit_exc = True
    print("In order to use the config file, please add its path to the OS environ as a variable eg:os.environ['WINNOW_CONFIG'] = [ABSFILEPATH]"  )
    
finally:

    if hit_exc:

        USE_LOCAL_PRETRAINED = False


if not USE_LOCAL_PRETRAINED:

    PRETRAINED_MODEL = 'vgg_16.ckpt'
    PRETRAINED_LOCAL_PATH = os.path.join(package_directory,'pretrained_models',PRETRAINED_MODEL)



# Pre-trained model file availability assessment

if os.path.exists(PRETRAINED_LOCAL_PATH):
    print('Pretrained Model Found')
else:
    if USE_LOCAL_PRETRAINED:
        try:
            print('Downloading pretrained model to:{}'.format(PRETRAINED_LOCAL_PATH))
            download_file(PRETRAINED_LOCAL_PATH,"https://s3.amazonaws.com/winnowpretrainedmodels/vgg_16.ckpt")
        except:
              print('Copying from source directory (as defined in the config file')
              print('Please check your config file and make sure you have a valid path to save the pretrained model ')
              raise 
    else:
        try:
            os.makedirs(os.path.join(package_directory,'pretrained_models'))
        except Exception as e:
            print(e)
            pass
        print('Downloading pretrained model to:{}'.format(PRETRAINED_LOCAL_PATH))
        download_file(PRETRAINED_LOCAL_PATH,"https://s3.amazonaws.com/winnowpretrainedmodels/vgg_16.ckpt")
     


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
    video_list = {i: video.strip() for i, video in enumerate(open(video_list, encoding="utf-8").readlines())}
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
            
            video_name = os.path.basename(video_list[video])
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

    model = CNN_tf('vgg', PRETRAINED_LOCAL_PATH)

    feature_extraction_videos(model, cores, batch_sz, video_list, output_path)

def load_featurizer():
    
    model = CNN_tf('vgg', PRETRAINED_LOCAL_PATH)
    
    return  model