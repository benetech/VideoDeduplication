import logging
import os
import sys
import time
import click
from dataclasses import asdict
from sklearn.neighbors import NearestNeighbors
from tqdm import tqdm

from db import Database
from db.utils import *
from winnow.feature_extraction import SimilarityModel
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import bulk_read
from winnow.utils import extract_additional_info, extract_scenes, filter_results, uniq, resolve_config,get_brightness_estimation

logging.getLogger().setLevel(logging.ERROR)
logging.getLogger("winnow").setLevel(logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

@click.command()
@click.option(
    '--config', '-cp',
    help='path to the project config file',
    default=None)


def main(config):

    print('Loading config file')
    config = resolve_config(config_path=config)
    reps = ReprStorage(config.repr.directory)

    # Get mapping (path,hash) => sig.
    print('Extracting Video Signatures')
    sm = SimilarityModel()
    vid_level_iterator = bulk_read(reps.video_level)

    assert len(vid_level_iterator) > 0, 'No video_level features were found'

    signatures_dict = sm.predict(bulk_read(reps.video_level))

    # Unpack paths, hashes and signatures as separate np.arrays
    repr_keys, video_signatures = zip(*signatures_dict.items())
    paths = np.array([key.path for key in repr_keys])
    hashes = np.array([key.hash for key in repr_keys])
    video_signatures = np.array(video_signatures)
    
    
    print('Finding Matches...')
    # Handles small tests for which number of videos <  number of neighbors
    t0 = time.time()
    neighbors = min(20,video_signatures.shape[0])
    nn = NearestNeighbors(n_neighbors=neighbors,metric='euclidean',algorithm='kd_tree')
    nn.fit(video_signatures)
    distances,indices =  nn.kneighbors(video_signatures)
    print('{} seconds spent finding matches '.format(time.time()-t0))
    results,results_distances = filter_results(config.proc.match_distance, distances, indices)

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

    REPORT_PATH = os.path.join(config.repr.directory, f'matches_at_{config.proc.match_distance}_distance.csv')

    print('Saving unfiltered report to {}'.format(REPORT_PATH))

    match_df.to_csv(REPORT_PATH)

    if config.proc.detect_scenes:

        frame_features_dict = bulk_read(reps.frame_level, select=None)
        scenes = extract_scenes(frame_features_dict)
        scene_metadata = pd.DataFrame(asdict(scenes))

        if config.database.use:
            # Connect to database
            database = Database(uri=config.database.uri)
            database.create_tables()

            # Save scenes
            result_storage = DBResultStorage(database)
            result_storage.add_scenes(zip(scenes.video_filename, scenes.video_sha256, scenes.scene_duration_seconds))

        if config.save_files:

            SCENE_METADATA_OUTPUT_PATH = os.path.join(config.repr.directory, 'scene_metadata.csv')
            scene_metadata.to_csv(SCENE_METADATA_OUTPUT_PATH)
            print('Scene Metadata saved in:'.format(SCENE_METADATA_OUTPUT_PATH))


    if config.proc.filter_dark_videos:

        print('Filtering dark and/or short videos')

        # Get original files for which we have both frames and frame-level features
        repr_keys = list(set(reps.video_level.list()))
        paths = [key.path for key in repr_keys]
        hashes = [key.hash for key in repr_keys]

        print('Extracting additional information from video files')
        brightness_estimation = np.array([get_brightness_estimation(reps, key) for key in tqdm(repr_keys)])
        print(brightness_estimation.shape)
        metadata_df = pd.DataFrame({"fn": paths,
                                    "sha256": hashes,
                                    "gray_max":brightness_estimation.reshape(brightness_estimation.shape[0])})

        # Flag videos to be discarded

        metadata_df['video_dark_flag'] = metadata_df.gray_max < config.proc.filter_dark_videos_thr

        print('Videos discarded because of darkness:{}'.format(metadata_df['video_dark_flag'].sum()))

        metadata_df['flagged'] = metadata_df['video_dark_flag'] 

        # Discard videos
        discarded_videos = metadata_df.loc[metadata_df['flagged'], :][['fn', 'sha256']]
        discarded_videos = set(tuple(row) for row in discarded_videos.to_numpy())

        # Function to check if the (path,hash) row is in the discarded set
        def is_discarded(row):
            return tuple(row) in discarded_videos

        msk_1 = match_df[['query_video', 'query_sha256']].apply(is_discarded, axis=1)
        msk_2 = match_df[['match_video', 'match_sha256']].apply(is_discarded, axis=1)
        discard_msk = msk_1 | msk_2

        FILTERED_REPORT_PATH = os.path.join(config.repr.directory,
                                            f'matches_at_{config.proc.match_distance}_distance_filtered.csv')
        METADATA_REPORT_PATH = os.path.join(config.repr.directory, 'metadata_signatures.csv')

        match_df = match_df.loc[~discard_msk,:]        
        
    if config.database.use:
        # Connect to database and ensure schema
        database = Database(uri=config.database.uri)
        database.create_tables()

        # Save metadata
        result_storage = DBResultStorage(database)
        
        if metadata_df is not None:

            metadata_entries = metadata_df[['fn', 'sha256']]
            metadata_entries['metadata'] = metadata_df.drop(columns=['fn', 'sha256']).to_dict('records')
            result_storage.add_metadata(metadata_entries.to_numpy())

        # Save matches
        match_columns = ['query_video', 'query_sha256', 'match_video', 'match_sha256', 'distance']

        result_storage.add_matches(match_df[match_columns].to_numpy())

    if config.save_files:

        print('Saving metadata to {}'.format(METADATA_REPORT_PATH))
        metadata_df.to_csv(METADATA_REPORT_PATH)
        print('Saving Filtered Matches report to {}'.format(METADATA_REPORT_PATH))
        match_df.to_csv(FILTERED_REPORT_PATH)


if __name__ == '__main__':
    main()
