import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from glob import glob 
from scipy.spatial.distance import cosine


def cosine_series(arr):
    output = [1.0]
    for i in range(len(arr)):
        if i < len(arr)-1:
            a = arr[i]
            b = arr[i+1]
            dist = cosine(a,b)
            output.append(dist)
    return np.array(output)
    

def visualize_frames(fp,diffs=None):
    video = np.load(fp)
    if diffs is not None:
        frames_idx = (diffs > np.quantile(diffs,.90)) & (diffs > 0.05)
        sample_frames = video[frames_idx]
    else:
        sample_frames = video[0::1,:,:,:]
    plot = sum(frames_idx) >= 3
    
    if plot:
        
        plt.figure(figsize=(10,10))
        plt.imshow(np.hstack(sample_frames))
        plt.show()

        plt.figure(figsize=(5,5))
        plt.plot(list(range(len(diffs))),diffs)
        plt.plot(list(range(len(diffs))),diffs*frames_idx,'bo')
        plt.show()
    
    
def naive_diff(arr):
    diffs = np.diff(arr)
    sdiffs = np.absolute(np.sum(diffs,axis=1))**24
    return np.insert(sdiffs,0,[1])
    
def visualize_features(fp,diff_function=cosine_series):
    nfp = fp.replace('frames','features')
    feats = np.load(nfp)
    sdiffs = diff_function(feats)

    return sdiffs

def visualize_vid(fp):
    sdiffs = visualize_features(fp)
    visualize_frames(fp,diffs=sdiffs)

def get_duration(scenes):
    return [y-x for x,y in scenes]

def extract_scenes(list_of_files,minimum_duration=10):

    filtered_videos = [x for x in list_of_files if np.load(x).shape[0] > minimum_duration]

    raw_scenes = [visualize_features(x) for x in filtered_videos]

    scene_ident = [((diffs > np.quantile(diffs,.90)) & (diffs > 0.05)) for diffs in raw_scenes]

    num_scens = [sum(sid) for sid in scene_ident]

    video_scenes = []
    for sid in scene_ident:
        idxs = np.array(list(range(len(sid))))[sid]
        scenes = []
        for z,i in enumerate(idxs):
            start = i
            if z == (len(idxs) - 1):
                end = len(sid) - 1
            else:
                end = idxs[z + 1]
            scenes.append([start,end])
        video_scenes.append(scenes)


    durations = [get_duration(x) for x in video_scenes]
    num_scenes = [len(x) for x in video_scenes]
    avg_duration = [np.mean(x) for x in durations]
    total_video = [sid.shape[0] for sid in scene_ident]
    return filtered_videos,durations,num_scenes,avg_duration,total_video