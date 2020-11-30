import pandas as pd
import numpy as np
from winnow.feature_extraction.loading_utils import evaluate, calculate_similarities, global_vector
from winnow.feature_extraction.utils import load_image
from winnow.utils.network import download_file
from winnow.feature_extraction import SimilarityModel
from collections import defaultdict
import os
import shutil
from glob import glob

def get_queries(min_num_of_samples, df, col='original_filename'):

    fc = df[col].value_counts()
    msk = fc >= min_num_of_samples

    return fc[msk].index.values


def get_query_dataset(df, query, ratio=.22, col='original_filename'):

    msk = df[col] == query
    occ = df.loc[msk, :]
    negative = df.loc[~msk, :]
    n_positive_samples = len(occ)
    positive_head = occ.sample(1)['new_filename'].values[0]

    query_total = n_positive_samples / ratio
    to_be_sampled = int(query_total - n_positive_samples)
    confounders = negative.sample(to_be_sampled)
    confounders.loc[:, 'label'] = 'X'
    occ.loc[:, 'label'] = 'E'
    merged = pd.concat([confounders, occ])

    query_d = dict()

    for i, row in merged.iterrows():

        query_d[row['new_filename']] = row['label']

    return positive_head, query_d


def get_ground_truth(available_df, queries, min_samples=4, ratio=0.2):

    ground_truth = dict()

    for query in queries:

        head, query_ds = get_query_dataset(available_df, query, ratio=ratio)

        ground_truth[head] = query_ds

    return ground_truth


def convert_ground_truth(gt, base_to_idx):

    queries = list(gt.keys())

    qi = {base_to_idx[x]: i+1 for i, x in enumerate(queries)}

    new_ds = dict()

    for k, v in gt.items():

        sub_d = dict()

        for kk, vv in v.items():

            sub_d[base_to_idx[kk]] = vv

        new_ds[qi[base_to_idx[k]]] = sub_d

    return new_ds


def get_result(df, 
               signatures,
               min_samples=4,
               ratio=0.25,
               all_videos=False,
               file_index=None):

    if file_index is None:

        signatures_data = np.array([np.load(x) for x in signatures])
        basename = [os.path.basename(x)[:-4] for x in signatures]

    else:

        basename = [os.path.basename(x)[:-4] for x in file_index]
        signatures_data = np.array(signatures)
        signatures = file_index

    basename_to_idx = {x: i for i, x in enumerate(basename)}

    queries = get_queries(min_samples, df)
    query_idx = [basename_to_idx[x] for x in queries]
    similarities = calculate_similarities(query_idx, signatures_data)

    ground_truth = get_ground_truth(df, queries, ratio=ratio)
    final_gt = convert_ground_truth(ground_truth, basename_to_idx)
    mAP, pr_curve = evaluate(final_gt, similarities, all_videos=all_videos)
    return mAP, pr_curve


def download_dataset(
       dst,
       url="https://winnowpre.s3.amazonaws.com/augmented_dataset.tar.xz"):

    if not os.path.exists(dst):

        os.makedirs(dst)

    number_of_files = len(glob(dst + '/**'))
    print('Files Found',number_of_files)

    if number_of_files < 2:

        print('Downloading sample dataset to:{}'.format(dst))

        fp = os.path.join(dst, 'dataset.tar.gz')
        if not os.path.isfile(fp):

            download_file(fp, url)
        # unzip files
        print('unpacking', fp)
        shutil.unpack_archive(fp, dst)
        # Delete tar
        os.unlink(fp)
    else:
        print('Files have already been downloaded')


def get_frame_sampling_permutations(frame_samplings, frame_level_files):

    d = defaultdict(list)

    for v in frame_level_files:

        data = np.load(v)

        for frame_sampling in frame_samplings:

            d[frame_sampling].append(data[::frame_sampling])

    sm = SimilarityModel()

    signatures = defaultdict(list)
    for fs in d.keys():

        video_level = np.array([global_vector(x) for x in d[fs]])
        signatures[fs].append(
                                sm.predict_from_features(
                                    video_level.reshape(
                                                video_level.shape[0],
                                                video_level.shape[2])))

    return signatures
