import logging
import os
import sys

import click
import yaml
from dataclasses import asdict
from sklearn.neighbors import NearestNeighbors
from tqdm import tqdm

from db import Database
from db.utils import *
from winnow.feature_extraction import SimilarityModel
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import path_resolver, bulk_read
from winnow.utils import extract_additional_info, extract_scenes, filter_results, uniq

logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))


@click.command()
@click.option(
    '--config', '-cp',
    help='path to the project config file',
    default='config.yaml')


def main(config):

    print('Loading config file')

    with open(config, 'r') as ymlfile:
        cfg = yaml.load(ymlfile)

    DST_DIR = cfg['destination_folder']
    ROOT_FOLDER_INTERMEDIATE_REPRESENTATION =cfg['root_folder_intermediate']
    DISTANCE = float(cfg['match_distance'])
    MIN_VIDEO_DURATION = float(cfg['min_video_duration_seconds'])
    HANDLE_DARK = cfg['filter_dark_videos']
    DETECT_SCENES = cfg['detect_scenes']
    DARK_THR = float(cfg['filter_dark_videos_thr'])
    DST_FOLDER = cfg['destination_folder']
    USE_DB = cfg['use_db']
    CONNINFO = cfg['conninfo']
    SAVE_FILES = cfg['keep_fileoutput'] or not USE_DB

    reps = ReprStorage(os.path.join(DST_DIR, ROOT_FOLDER_INTERMEDIATE_REPRESENTATION))

    # Get mapping (path,hash) => sig.
    print('Extracting Video Signatures')
    sm = SimilarityModel()
    signatures_dict = sm.predict(bulk_read(reps.video_level))

    # Unpack paths, hashes and signatures as separate np.arrays
    path_hash_pairs, video_signatures = zip(*signatures_dict.items())
    paths, hashes = map(np.array, zip(*path_hash_pairs))
    video_signatures = np.array(video_signatures)


    print('Finding Matches...')
    # Handles small tests for which number of videos <  number of neighbors
    neighbors = min(20,video_signatures.shape[0])
    nn = NearestNeighbors(n_neighbors=neighbors,metric='euclidean',algorithm='kd_tree')
    nn.fit(video_signatures)
    distances,indices =  nn.kneighbors(video_signatures)

    results,results_distances = filter_results(DISTANCE,distances,indices)

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
    match_df['query_video'] = paths[match_df['query']]
    match_df['query_sha256'] = hashes[match_df['query']]
    match_df['match_video'] = paths[match_df['match']]
    match_df['match_sha256'] = hashes[match_df['match']]
    match_df['self_match'] = match_df['query_video'] == match_df['match_video']
    # Remove self matches
    match_df = match_df.loc[~match_df['self_match'],:]
    # Creates unique index from query, match 
    match_df['unique_index'] = match_df.apply(uniq,axis=1)
    # Removes duplicated entries (eg if A matches B, we don't need B matches A)
    match_df = match_df.drop_duplicates(subset=['unique_index'])


    REPORT_PATH = DST_FOLDER + '/matches_at_{}_distance.csv'.format(DISTANCE)

    print('Saving unfiltered report to {}'.format(REPORT_PATH))

    match_df.to_csv(REPORT_PATH)

    if DETECT_SCENES:

        frame_features_dict = bulk_read(reps.frame_level, select=None)
        scenes = extract_scenes(frame_features_dict)
        scene_metadata = pd.DataFrame(asdict(scenes))

        if USE_DB:
            # Connect to database
            database = Database(uri=CONNINFO)
            database.create_tables()

            # Save scenes
            result_storage = DBResultStorage(database)
            result_storage.add_scenes(zip(scenes.video_filename, scenes.video_sha256, scenes.scene_duration_seconds))

        if SAVE_FILES:

            SCENE_METADATA_OUTPUT_PATH = os.path.join(DST_FOLDER,'scene_metadata.csv')
            scene_metadata.to_csv(SCENE_METADATA_OUTPUT_PATH)
            print('Scene Metadata saved in:'.format(SCENE_METADATA_OUTPUT_PATH))


    if HANDLE_DARK:

        print('Filtering dark and/or short videos')

        # Get original files for which we have both frames and frame-level features
        path_hash_pairs = list(set(reps.frame_level.list()) & set(reps.frames.list()))
        paths, hashes = zip(*path_hash_pairs)

        print('Extracting additional information from video files')
        frame_level_data = np.array([extract_additional_info(reps, *path_hash) for path_hash in tqdm(path_hash_pairs)])
        video_length = np.array(frame_level_data)[:,0]
        video_avg_act = frame_level_data[:,1]
        video_avg_mean = frame_level_data[:,2]
        video_avg_max_dif = frame_level_data[:,3]
        gray_avg = frame_level_data[:,4]
        gray_std = frame_level_data[:,5]
        gray_max = frame_level_data[:, 6]

        metadata_df = pd.DataFrame({"fn": paths,
                                    "sha256": hashes,
                                    "video_length":video_length,
                                    "avg_act":video_avg_act,
                                    "video_avg_std":video_avg_mean,
                                    "video_max_dif":video_avg_max_dif,
                                    "gray_avg":gray_avg,
                                    "gray_std":gray_std,
                                    "gray_max":gray_max})

        # Flag videos to be discarded
        metadata_df['video_duration_flag'] = metadata_df.video_length < MIN_VIDEO_DURATION

        print('Videos discarded because of duration:{}'.format(metadata_df['video_duration_flag'].sum()))

        metadata_df['video_dark_flag'] = metadata_df.gray_max < DARK_THR

        print('Videos discarded because of darkness:{}'.format(metadata_df['video_dark_flag'].sum()))

        metadata_df['flagged'] = metadata_df['video_dark_flag'] | metadata_df['video_duration_flag']

        # Discard videos
        discarded_videos = metadata_df.loc[metadata_df['flagged'], :][['fn', 'sha256']]
        discarded_videos = set(tuple(row) for row in discarded_videos.to_numpy())

        # Function to check if the (path,hash) row is in the discarded set
        def is_discarded(row):
            return tuple(row) in discarded_videos

        msk_1 = match_df[['query_video', 'query_sha256']].apply(is_discarded, axis=1)
        msk_2 = match_df[['match_video', 'match_sha256']].apply(is_discarded, axis=1)
        discard_msk = msk_1 | msk_2

        FILTERED_REPORT_PATH = DST_FOLDER + '/matches_at_{}_distance_filtered.csv'.format(DISTANCE)
        METADATA_REPORT_PATH = DST_FOLDER + '/metadata_signatures.csv'

        filtered_match_df = match_df.loc[~discard_msk,:]
        filtered_match_df.to_csv(FILTERED_REPORT_PATH)



        print('Saving filtered report to {}'.format(FILTERED_REPORT_PATH))

        if USE_DB:
            # Connect to database and ensure schema
            database = Database(uri=CONNINFO)
            database.create_tables()

            # Save metadata
            result_storage = DBResultStorage(database)
            metadata_entries = metadata_df[['fn', 'sha256']]
            metadata_entries['metadata'] = metadata_df.drop(columns=['fn', 'sha256']).to_dict('records')
            result_storage.add_metadata(metadata_entries.to_numpy())

            # Save matches
            match_columns = ['query_video', 'query_sha256', 'match_video', 'match_sha256', 'distance']
            result_storage.add_matches(filtered_match_df[match_columns].to_numpy())

        if SAVE_FILES:

            print('Saving metadata to {}'.format(METADATA_REPORT_PATH))
            metadata_df.to_csv(METADATA_REPORT_PATH)


if __name__ == '__main__':
    main()
