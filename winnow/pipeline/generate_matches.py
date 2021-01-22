import logging
import os
import time
from dataclasses import asdict

import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from tqdm import tqdm

from db import Database
from winnow.feature_extraction import SimilarityModel
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.repr_utils import bulk_read
from winnow.utils.brightness import get_brightness_estimation
from winnow.utils.matches import filter_results
from winnow.utils.scene_detection import extract_scenes
from winnow.utils.repr import reprkey_resolver


def generate_matches(config, progress_monitor=ProgressMonitor.NULL, files=[]):  # noqa: C901
    """Find matches between video files."""

    logger = logging.getLogger(__name__)
    reps = ReprStorage(config.repr.directory)
    reprkey = reprkey_resolver(config)

    if files:
        files_reprkey = [reprkey(s) for s in files]

    # Get mapping (path,hash) => sig.
    logger.info("Extracting Video Signatures")

    signature_iterator = bulk_read(reps.signature)

    if len(signature_iterator) == 0:

        vid_level_iterator = bulk_read(reps.video_level)
        assert len(vid_level_iterator) > 0, "No video_level features were found"
        sm = SimilarityModel()
        signatures_dict = sm.predict(bulk_read(reps.video_level))
        # Unpack paths, hashes and signatures as separate np.arrays
        repr_keys, video_signatures = zip(*signatures_dict.items())

    else:
        repr_keys, video_signatures = zip(*signature_iterator.items())

    paths = np.array([key.path for key in repr_keys])
    hashes = np.array([key.hash for key in repr_keys])
    video_signatures = np.array(video_signatures)

    logger.info("Finding Matches...")
    # Handles small tests for which number of videos <  number of neighbors
    t0 = time.time()
    neighbors = min(20, video_signatures.shape[0])
    nn = NearestNeighbors(n_neighbors=neighbors, metric="euclidean", algorithm="kd_tree")
    nn.fit(video_signatures)
    if files:
        # limit signatures to files supplied
        sigs_of_interest = [i for i, path in enumerate(files) if reps.signature.exists(reprkey(path))]
        incremental_video_signatures = np.array(video_signatures)[sigs_of_interest]
        distances, indices = nn.kneighbors(incremental_video_signatures)

    else:
        distances, indices = nn.kneighbors(video_signatures)

    logger.info("{} seconds spent finding matches ".format(time.time() - t0))
    results, results_distances = filter_results(config.proc.match_distance, distances, indices)

    progress_monitor.increase(amount=0.5)

    ss = sorted(zip(results, results_distances), key=lambda x: len(x[0]), reverse=True)
    results_sorted = [x[0] for x in ss]
    results_sorted_distance = [x[1] for x in ss]

    q = []
    m = []
    distance = []

    logger.info("Generating Report")
    for i, r in enumerate(results_sorted):
        for j, matches in enumerate(r):
            if j == 0:
                qq = matches
            q.append(qq)
            m.append(matches)
            distance.append(results_sorted_distance[i][j])

    match_df = pd.DataFrame({"query": q, "match": m, "distance": distance})
    match_df["query_video"] = paths[match_df["query"]]
    match_df["query_sha256"] = hashes[match_df["query"]]
    match_df["match_video"] = paths[match_df["match"]]
    match_df["match_sha256"] = hashes[match_df["match"]]
    match_df["self_match"] = match_df["query_video"] == match_df["match_video"]
    # Remove self matches
    match_df = match_df.loc[~match_df["self_match"], :]

    # Creates unique index from query, match
    def unique(row):
        return "".join([str(x) for x in sorted([row["query"], row["match"]])])

    match_df["unique_index"] = match_df.apply(unique, axis=1)
    # Removes duplicated entries (eg if A matches B, we don't need B matches A)
    match_df = match_df.drop_duplicates(subset=["unique_index"])

    REPORT_PATH = os.path.join(config.repr.directory, f"matches_at_{config.proc.match_distance}_distance.csv")

    logger.info("Saving unfiltered report to {}".format(REPORT_PATH))

    match_df.to_csv(REPORT_PATH)

    if config.proc.detect_scenes:

        frame_level_reps = reps.frame_level.list()
        if files:
            frame_level_reps = files_reprkey

        scenes = extract_scenes(frame_level_reps, reps.frame_level)
        scene_metadata = pd.DataFrame(asdict(scenes))

        if config.database.use:
            # Connect to database
            database = Database(uri=config.database.uri)
            database.create_tables()

            # Save scenes
            result_storage = DBResultStorage(database)
            result_storage.add_scenes(zip(scenes.video_filename, scenes.video_sha256, scenes.scene_duration_seconds))

        if config.save_files:

            SCENE_METADATA_OUTPUT_PATH = os.path.join(config.repr.directory, "scene_metadata.csv")
            scene_metadata.to_csv(SCENE_METADATA_OUTPUT_PATH)
            logger.info("Scene Metadata saved in: %s", SCENE_METADATA_OUTPUT_PATH)

    if config.proc.filter_dark_videos:

        logger.info("Filtering dark and/or short videos")

        # Get original files for which we have both frames and frame-level features
        repr_keys = list(set(reps.video_level.list()))
        if files:
            repr_keys = [x for x in repr_keys if x in files_reprkey]

        paths = [key.path for key in repr_keys]
        hashes = [key.hash for key in repr_keys]

        logger.info("Extracting additional information from video files")
        brightness_estimation = np.array([get_brightness_estimation(reps, key) for key in tqdm(repr_keys)])
        logger.info(brightness_estimation.shape)
        metadata_df = pd.DataFrame(
            {"fn": paths, "sha256": hashes, "gray_max": brightness_estimation.reshape(brightness_estimation.shape[0])}
        )

        # Flag videos to be discarded
        metadata_df.loc[:, "video_dark_flag"] = metadata_df.gray_max < config.proc.filter_dark_videos_thr

        logger.info("Videos discarded because of darkness:{}".format(metadata_df["video_dark_flag"].sum()))

        metadata_df.loc[:, "flagged"] = metadata_df["video_dark_flag"]

        # Discard videos
        discarded_videos = metadata_df.loc[metadata_df["flagged"], :][["fn", "sha256"]].to_numpy()
        discarded_videos = set(tuple(row) for row in discarded_videos)

        # Function to check if the (path,hash) row is in the discarded set
        def is_discarded(row):
            return tuple(row) in discarded_videos

        msk_1 = match_df.loc[:, ["query_video", "query_sha256"]].apply(is_discarded, axis=1)
        msk_2 = match_df.loc[:, ["match_video", "match_sha256"]].apply(is_discarded, axis=1)
        discard_msk = msk_1 | msk_2

        match_df = match_df.loc[~discard_msk, :]

        if config.database.use:
            database = Database(uri=config.database.uri)
            database.create_tables()
            result_storage = DBResultStorage(database)
            metadata_entries = metadata_df.loc[:, ["fn", "sha256"]]
            metadata_entries.loc[:, "metadata"] = metadata_df.drop(columns=["fn", "sha256"]).to_dict("records")
            # metadata_entries["metadata"] = metadata_df.drop(columns=["fn", "sha256"]).to_dict("records")
            result_storage.add_metadata(metadata_entries.to_numpy())

        if config.save_files:

            FILTERED_REPORT_PATH = os.path.join(
                config.repr.directory, f"matches_at_{config.proc.match_distance}_distance_filtered.csv"
            )
            METADATA_REPORT_PATH = os.path.join(config.repr.directory, "metadata_signatures.csv")

            logger.info("Saving metadata to {}".format(METADATA_REPORT_PATH))
            metadata_df.to_csv(METADATA_REPORT_PATH)
            logger.info("Saving Filtered Matches report to {}".format(METADATA_REPORT_PATH))
            match_df.to_csv(FILTERED_REPORT_PATH)

    if config.database.use:
        # Connect to database and ensure schema
        database = Database(uri=config.database.uri)
        database.create_tables()
        # Save metadata
        result_storage = DBResultStorage(database)
        # Save matches
        match_columns = ["query_video", "query_sha256", "match_video", "match_sha256", "distance"]
        # Saves matches to DB (matches related to dark videos (if that option was set to true) won't be saved)
        result_storage.add_matches(match_df.loc[:, match_columns].to_numpy())

    progress_monitor.complete()
