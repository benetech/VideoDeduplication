import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from glob import glob 
from scipy.spatial.distance import cosine
import datetime

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


def seconds_to_time(list_of_durations):
    start = 0 
    results = []
    for i,n in enumerate(list_of_durations):
        n = int(n)
        
        if i == 0:
            start_time = datetime.timedelta(seconds=0)
            end_time = datetime.timedelta(seconds=n)
        else:
            start_time = end_time
            end_time = start_time + datetime.timedelta(seconds=n)

        results.append((str(start_time),str(end_time)))

    return results


def extract_scenes(list_of_files,minimum_duration=10):
    """Extracts scenes from a list of files
    
    Arguments:
        list_of_files {[List[npy files]]} -- List of filepaths for framelevel representations of videos
    
    Keyword Arguments:
        minimum_duration {int} -- Minimum duration of video in seconds. (default: {10})
    
    Returns:
        Filtered Videos [list] -- List of the videos processed (after filtering for the minimum duration threshold)
        Durations [list[Duration]] -- List of lists containing duration (in seconds) of each scene where List i corresponds to filtered_video[i]
        Number of Scenes [list] -- Derived from Durations -> Mainly the length of the list of scene durations
        Average Duration [list] -- Derived from Durations -> Average Scene length
        Total Video Duration [list] -- Total video duration
    """

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
    scenes_timestamp = [seconds_to_time(d) for d in durations]
    num_scenes = [len(x) for x in video_scenes]
    avg_duration = [np.mean(x) for x in durations]
    total_video = [sid.shape[0] for sid in scene_ident]
    total_video_duration_timestamp = [datetime.timedelta(seconds=x) for x in total_video]

    return filtered_videos,durations,num_scenes,avg_duration,total_video,scenes_timestamp,total_video_duration_timestamp