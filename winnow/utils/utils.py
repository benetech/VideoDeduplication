import numpy as np
from glob import glob
import hashlib
import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from winnow.feature_extraction import SimilarityModel
from pathlib import Path
import cv2
import yaml


def create_directory(directories,root_dir,alias):

    for r in directories:
        try:
            os.makedirs(os.path.abspath(os.path.join(root_dir,alias,r)))
        except Exception as e:
            print(e)

def filter_extensions(files,extensions):

    return [x for x in files if Path(x).suffix in extensions]





def scan_videos(path,wildcard,extensions = []):
    """Scans a directory for a given wildcard

    Args:
        path (String): Root path of the directory to be scanned
        wildcard (String): Wild card related to the files being searched (eg. ** for video files or **_vgg_features.npy for extracted features files)
        extensions (list, optional): Filter files by giving a list of supported file extensions (eg a list of video extensions). Defaults to [].

    Returns:
        List[String]: A list of file paths
    """

    files = glob(os.path.join(path,wildcard),recursive = True)
    files = [x for x in files if os.path.isfile(x)]
    if len(extensions) > 0:
        files = filter_extensions(files,extensions)

    return files

def scan_videos_from_txt(fp,extensions =[]):

    files = list(open(fp, encoding="utf-8").read().splitlines())
    files = [x for x in files if os.path.isfile(x)]
    if len(extensions) > 0:
        files = filter_extensions(files,extensions)
    return files



    







def get_original_fn_from_artifact(fp_list,sep):
    """Get original video filename using our encoding convention for generating additional training
    artifacts

    Arguments:
        fp_list {List} -- List of filepaths to training artifacts (such as [path/filename.mp4_vgg_features.npy])
        sep {String} -- Artifact separator (eg. 'vgg_features.npy')

    Returns:
        [List] -- List of the original video filenames
    """

    return  [os.path.basename(x).split(sep)[0] for x in fp_list]


def create_video_list(videos_to_be_processed,fp):

    with open(fp, 'w', encoding="utf-8") as f:
        for item in videos_to_be_processed:
            f.write("%s\n" % item)

    return os.path.abspath(fp)



def filter_results(thr,distances,indices):
    results = []
    results_distances = []
    msk = distances < thr
    for i,r in enumerate(msk):
        results.append(indices[i,r])
        results_distances.append(distances[i,r])
    return results,results_distances

def uniq(row):
    
    return ''.join([str(x) for x in sorted([row['query'],row['match']])])

def extract_additional_info(x):
    
    v = np.load(x)
    frames = np.load(x.replace('_vgg_features','_vgg_frames'))
    grays = np.array([cv2.cvtColor(x,cv2.COLOR_BGR2GRAY) for x in frames])
    grays = np.array([np.mean(x) for x in grays])

    grays_avg = np.mean(grays,axis=0)
    grays_std = np.std(grays,axis=0)
    try:
        grays_max = np.max(grays)
    except:
        grays_max = 0

    shape = v.shape
    intra_sum = np.sum(v,axis=1)
    mean_act = np.mean(intra_sum)
    try:
        
        max_dif = np.max(intra_sum) - np.min(intra_sum)
        
    except:
        max_dif = 0
    std_sum = np.std(intra_sum)
    
    return shape[0],mean_act,std_sum,max_dif,grays_avg,grays_std,grays_max


def get_hash(fp,buffer_size = 65536):
    
    sha256 = hashlib.sha256()
    with open(fp, 'rb') as f:
        while True:
            data = f.read(buffer_size)
            if not data:
                break
            sha256.update(data)

    return sha256.hexdigest()
