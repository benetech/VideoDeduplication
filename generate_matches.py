from glob import glob
import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from winnow.feature_extraction import SimilarityModel

import yaml

print('Loading config file')

<<<<<<< aef9c07a22dc921c886c6f23cb19b4ee7585cd40
with open("./config.yaml", 'r') as ymlfile:
=======
with open("config.yaml", 'r') as ymlfile:
>>>>>>> Report Improvements and Automatic Detection of files that have already been processed
    cfg = yaml.load(ymlfile)


VIDEO_SIGNATURES_SAVE_FOLDER = cfg['video_signatures_folder'] 
DISTANCE = float(cfg['match_distance'])
DST_FOLDER = cfg['destination_folder']
VIDEO_LEVEL_SAVE_FOLDER = cfg['video_level_folder']

print('Extracting Video Signatures')
sm = SimilarityModel()
video_signatures = sm.predict(VIDEO_LEVEL_SAVE_FOLDER)
video_signatures = np.nan_to_num(video_signatures)
labels = np.array([x.split('_vgg')[0].split('/')[-1] for x in  sm.index])


def filter_results(thr):
    results = []
    results_distances = []
    msk = distances < thr
    for i,r in enumerate(msk):
        results.append(indices[i,r])
        results_distances.append(distances[i,r])
    return results,results_distances

def uniq(row):
    
    return ''.join([str(x) for x in sorted([row['query'],row['match']])])



print('Finding Matches...')
nn = NearestNeighbors(n_neighbors=50,metric='euclidean',algorithm='kd_tree')
nn.fit(video_signatures)
distances,indices = nn.kneighbors(video_signatures)


results,results_distances = filter_results(DISTANCE)

ss = sorted(zip(results,results_distances),key=lambda x:len(x[0]),reverse=True)
results_sorted = [x[0] for x in ss]
results_sorted_distance = [x[1] for x in ss]


q = []
m = []
distance = []

print('Generating Report')
for i,r in enumerate(results_sorted):
    for j,matches in enumerate(r):
        if j == 0:
            qq = matches
        q.append(qq)
        m.append(matches)
        distance.append(results_sorted_distance[i][j])

match_df = pd.DataFrame({"query":q,"match":m,"distance":distance})            
match_df['query_video'] = labels[match_df['query']]
match_df['match_video'] = labels[match_df['match']]
match_df['self_match'] = match_df['query_video'] == match_df['match_video']
# Remove self matches
match_df = match_df.loc[~match_df['self_match'],:]
# Creates unique index from query, match 
match_df['unique_index'] = match_df.apply(uniq,axis=1)
# Removes duplicated entries (eg if A matches B, we don't need B matches A)
match_df = match_df.drop_duplicates(subset=['unique_index'])


REPORT_PATH = DST_FOLDER + '/matches_at_{}_distance.csv'.format(DISTANCE)

print('Saving report to {}'.format(REPORT_PATH))

match_df.to_csv(REPORT_PATH)
