import numpy as np
from tqdm import tqdm
from pprint import pprint
from cuml.cluster import HDBSCAN
from cuml.metrics import pairwise_distances
from collections import Counter



def get_relevant_information(data, fitted_clus, calc_dm=True,metric='euclidean'):
    """Calculates relevant metrics for a collection of video signatures and a fitted HDBSCAN model

    Args:
        data (np.array): List of signatures
        fitted_clus (_type_): Fitted HDBSCAN Model
        calc_dm (bool, optional): Whether to calculate the distance matrix for this collection. Defaults to True.
        metric (str, optional): _description_. Defaults to 'euclidean'.

    Returns:
        _type_: _description_
    """

    cluster_labels = fitted_clus.labels_

    unique_files, cluster_frequency, avg_distance_list,dms = get_unique_files(data, cluster_labels, calc_dm=calc_dm,metric=metric)

    print(f"{unique_files}/{data.shape[0]:,} (Unique/Total Videos")


    return unique_files, cluster_frequency, avg_distance_list,dms



def get_distance_matrix_cluster(data, cluster_labels, cluster_id,dm_placeholder,metric='euclidean'):

    """
    Updates Distance Matrix for the current collection of clusters
    
    """
    idx = np.arange(data.shape[0])
    msk = cluster_labels == cluster_id

    filtered = data[msk]
    filtered_idx = idx[msk]

    dm = pairwise_distances(filtered,metric=metric)

    items = filtered.shape[0]

    for i in range(items):
        original_idx_x = filtered_idx[i]
        for j in range(items):
            original_idx_y = filtered_idx[j]
            distance = dm[i,j]
            dm_placeholder[original_idx_x,original_idx_y] = distance

    mean_dist = np.sum(dm) / (dm.shape[0] ** 2 - dm.shape[0])

    return mean_dist,dm_placeholder


def get_unique_files(data, cluster_labels, non_cluster_id=-1, calc_dm=True,metric='euclidean'):

    """
    Calculates the number of unique files as a sum of the number of unique clusters and the number of non-cluster videos.
    Also returns the semi-calculated distance matrix for the collection (as an aggregation of distance matrixes of each cluster)
    
    """

    unique_files = 0
    cluster_frequency = dict(Counter(cluster_labels))
    avg_distance_list = []

    n_cluster_elements = len(data) - cluster_frequency[-1]

    # Placeholder distance is set to 2 as the distance between videos in different clusters is not calculated
    dm_placeholder = np.ones((data.shape[0],data.shape[0])) * 2
    # Setting 0 distances to self matches
    dm_placeholder[np.diag_indices_from(dm_placeholder)] = 0

    for k, v in tqdm(cluster_frequency.items()):
        # Label -1 means it wasn't determined to be a cluster
        if k == non_cluster_id:
            unique_files += v
        else:
            unique_files += 1
            if calc_dm:
                mean_dist, dm_placeholder = get_distance_matrix_cluster(data, cluster_labels, k,dm_placeholder,metric)
                
            else:
                mean_dist = 0
            avg_distance_list.append((k, mean_dist, (mean_dist * v) / n_cluster_elements, v))
            


    return unique_files, cluster_frequency, avg_distance_list,dm_placeholder



def get_distances_and_indices(dm):
    """
    Converts Distance matrix to a format compatible with the previous Annoy api - Assumes 0 distances are self matches and 2 were not calculated
    """
    distances = []
    indices = []
    
    idxs = np.arange(dm.shape[0])

    for row in dm:

        row = np.array(row)
        # Removing self matches and irrelevant distances
        msk = (row > 0) & (row < 2)

        dists = row[msk]
        inds = idxs[msk]
        distances.append(dists)
        indices.append(inds)
        
    return np.array(distances),np.array(indices)