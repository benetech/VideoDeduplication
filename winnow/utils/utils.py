import numpy as np
from glob import glob
import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from winnow.feature_extraction import SimilarityModel
import cv2
import yaml


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