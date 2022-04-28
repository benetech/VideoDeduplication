from tqdm import tqdm
from pprint import pprint
from cuml.cluster import HDBSCAN
from cuml.metrics import pairwise_distances
from collections import Counter
from typing import Sequence

import numpy as np
from annoy import AnnoyIndex

from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from .rapids_utils import get_relevant_information,get_distance_matrix_cluster,get_unique_files,get_distances_and_indices



class RapidsMatcher:
    """ 
    Rapids api for generating matches for a given collection of video signatures. Created as
    a drop in replacement for the original AnnoyNNeighbors.

    
    """
    
    @staticmethod
    def _resolve_metric(metric: str) -> str:
        """Resolve annoy metric."""
        if metric == "angular":
            return "cosine"
        return metric

    def __init__(
        self,
        min_cluster_size=2,
        metric="euclidean"):
        self.metric = self._resolve_metric(metric)
        self.model = None
        self.min_cluster_size = min_cluster_size



    def fit(self, data):

        clus = HDBSCAN(min_cluster_size=self.min_cluster_size,verbose=True)
        clus.fit(data)
        self.model = clus
        return self

    def kneighbors(
        self,
        data: Sequence[np.ndarray],
        return_distance: bool = True, 
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ):

        data = np.array(data)
        if self.model is None:
            self.fit(data)



        unique_files, cluster_frequency, avg_distance_list,final_dm = get_relevant_information(data, self.model, calc_dm=True,metric=self.metric)

        self.unique_files = unique_files
        self.cluster_frequency = cluster_frequency
        self.avg_distance_list = avg_distance_list

        distances,indices = get_distances_and_indices(final_dm)

        return distances,indices
