import matplotlib.pyplot as plt
import numpy as np
from sklearn.neighbors import NearestNeighbors,KDTree,BallTree,LSHForest,NearestCentroid
from pyvis.network import Network
from winnow.feature_extraction import SimilarityModel
import yaml

sm = SimilarityModel()
print('Loading config file')

with open("config.yaml", 'r') as ymlfile:
    cfg = yaml.load(ymlfile)


DISTANCE = float(cfg['match_distance'])
DST_FOLDER = cfg['destination_folder']
VIDEO_LEVEL_SAVE_FOLDER = cfg["video_level_folder"]


print('Extracting Video Signatures')
sm = SimilarityModel()
video_signatures = sm.predict(VIDEO_LEVEL_SAVE_FOLDER)
video_signatures = np.nan_to_num(video_signatures)
labels = np.array([x.split('_vgg')[0].split('/')[-1] for x in  sm.index])

def filter_results(distances,indexes,thr):
    results = []
    results_distances = []
    msk = distances < thr
    for i,r in enumerate(msk):
        results.append(indexes[i,r])
        results_distances.append(distances[i,r])
    return results,results_distances


def evaluate_match_based(video_space,estimator,plot=True,thr=0.4):
    
    estimator.fit(video_space)
    distances,indexes = estimator.kneighbors(video_space,n_neighbors=20)
    if plot == True:
        plt.hist(distances[:,1::].ravel(),bins=100)
        
    
    results,results_distances = filter_results(distances,indexes,thr)
    
    net = Network(notebook=True,height='1000px',width='1000px')
    net.barnes_hut()

    for i,l in enumerate(labels):
        net.add_node(str(i),label=str(l))

    for i,d in enumerate(results):
        for j,m in enumerate(d):
            if j != 0:
                net.add_edge(str(i),str(m),weight=str(results_distances[i][j]))

    net.show_buttons(filter_=['physics'])
    net.show('mygraph.html')
    return net
    
    

print('Building Network Graph....')
nearest_neighbor_net = evaluate_match_based(video_signatures,NearestNeighbors(n_neighbors=50,metric='euclidean',algorithm='kd_tree'),thr=0.3)

NETWORK_VIS_PATH = DST_FOLDER  + '/nn.html'

print('Saving to :',NETWORK_VIS_PATH)
nearest_neighbor_net.show(NETWORK_VIS_PATH)
