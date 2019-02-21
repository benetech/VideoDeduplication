import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics import pairwise_distances
import matplotlib.pyplot as plt
from collections import Counter
import pandas as pd
from .scene_summary import get_video_summary,get_video_summary_list

class DuplicateDetector:


    def __init__(self,distance=0.001,signatures = None,metric='cosine'):
        self.distance = distance
        self.file_index = signatures
        self.clustering = None
        self.clusters = []
        self.metric = metric
        self.video_signatures = None
        self.df = None

    def find(self,video_signatures):
        self.video_signatures = video_signatures
        self.clustering = DBSCAN(min_samples=1,eps=self.distance,metric=self.metric)
        self.clusters = self.clustering.fit_predict(self.video_signatures)
        print('Number of Files:{} - Number of Clusters:{}'.format(video_signatures.shape[0],len(np.unique(self.clusters))))
        self.df = pd.DataFrame({'signature_fp':self.file_index,'cluster':self.clusters})
        self.df['file_name'] = self.df['signature_fp'].apply(lambda x:x.split('/')[-1].split('.')[0].split('_vgg')[0])

        return self.clusters

    def summary(self):
        return self.df['cluster'].value_counts()
        

    def show_distance_matrix(self,comparison=False):

        D = pairwise_distances(self.video_signatures)
        sorting_msk = np.argsort(self.clusters)
        sorted_pd = np.array([x[sorting_msk] for x in D])
        sorted_pd = sorted_pd[sorting_msk,:]
        _,ax = plt.subplots(nrows=1,ncols=2,figsize=(20,20))
        ax[0].imshow(D,zorder=5,cmap='Blues',interpolation=None)
        ax[0].set_title('Original Distance Matrix')
        ax[1].imshow(sorted_pd,zorder=5,cmap='Blues',interpolation=None)
        ax[1].set_title('Distance Matrix - Sorted by Cluster')
        print('White Square should show concentrations of duplicated documents')

    def attach_source_videos(self,fp,column = 'fp'):
        print(fp)
        video_list = pd.read_csv(fp,header=None,names=[column])
        video_list['file_name'] = video_list['fp'].apply(lambda x:x.split('/')[-1].split('.')[0])
        self.df = self.df.merge(video_list,on='file_name')

    def show_cluster(self,cluster_id):
        subset = self.df.loc[self.df['cluster'] == cluster_id,:]
        summaries = get_video_summary_list(subset.fp)
        return summaries

        




