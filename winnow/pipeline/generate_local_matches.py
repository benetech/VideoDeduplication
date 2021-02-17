import logging
import os
from time import time
from typing import Collection, Dict

import pandas as pd
from dataclasses import asdict
from tqdm import tqdm

from winnow.duplicate_detection.neighbors import NeighborMatcher
from winnow.pipeline.extract_video_level_features import video_features_exist, extract_video_level_features
from winnow.pipeline.extract_video_signatures import video_signatures_exist, extract_video_signatures
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.repr_key import ReprKey
from winnow.storage.repr_utils import bulk_read
from winnow.utils.brightness import get_brightness_estimation

# Default module logger
logger = logging.getLogger(__name__)


def generate_local_matches(files: Collection[str], pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Find matches between video files."""

    files = tuple(files)
    config = pipeline.config

    # There is no way to check if matches are already generated.
    # Hence we must always attempt to generate matches.

    # Ensure dependencies are satisfied
    if not video_features_exist(files, pipeline) and config.proc.filter_dark_videos:
        extract_video_level_features(files, pipeline, progress=progress.subtask(0.9))
        progress = progress.subtask(0.1)
    if not video_signatures_exist(files, pipeline):
        extract_video_signatures(files, pipeline, progress=progress.subtask(0.7))
        progress = progress.subtask(0.3)

    logger.info("Starting match detection for %s files", len(files))

    # Load signatures
    all_signatures = bulk_read(pipeline.repr_storage.signature)
    req_signatures = bulk_read(pipeline.repr_storage.signature, select=map(pipeline.reprkey, files))

    # Do find matches
    start_time = time()
    neighbor_matcher = NeighborMatcher(haystack=all_signatures)
    matches = neighbor_matcher.find_matches(needles=req_signatures, max_distance=config.proc.match_distance)
    logger.info(f"Match detection took {time() - start_time:.3f} seconds")
    progress.increase(amount=0.5)

    # Save unfiltered report
    unfiltered_report_name = f"matches_at_{config.proc.match_distance}_distance.csv"
    unfiltered_report_path = os.path.join(config.repr.directory, unfiltered_report_name)
    logger.info("Saving unfiltered report to %s", unfiltered_report_path)
    _save_matches_csv(matches, unfiltered_report_path)

    # Filter dark videos
    if config.proc.filter_dark_videos:
        logger.info("Filtering dark and/or short videos")

        video_features = pipeline.repr_storage.video_level
        repr_keys = tuple(map(pipeline.reprkey, files))
        brightness = {key: get_brightness_estimation(video_features.read(key)) for key in tqdm(repr_keys)}

        threshold = config.proc.filter_dark_videos_thr
        metadata = {key: _metadata(gray_max, threshold) for key, gray_max in brightness.items()}

        discarded = {key for key, meta in metadata.items() if meta["flagged"]}
        matches = list(_reject(matches, discarded))

        if config.database.use:
            result_storage = pipeline.result_storage
            result_storage.add_metadata((key.path, key.hash, meta) for key, meta in metadata.items())

        if config.save_files:
            filtered_report_name = f"matches_at_{config.proc.match_distance}_distance_filtered.csv"
            filtered_report_path = os.path.join(config.repr.directory, filtered_report_name)
            logger.info("Saving Filtered Matches report to %s", filtered_report_path)
            _save_matches_csv(matches, filtered_report_path)

            metadata_report_path = os.path.join(config.repr.directory, "metadata_signatures.csv")
            logger.info("Saving metadata to %s", metadata_report_path)
            _save_metadata_csv(metadata, metadata_report_path)

    if config.database.use:
        result_storage = pipeline.result_storage
        result_storage.add_matches(_entry(match) for match in matches)

    progress.complete()


def _metadata(gray_max, threshold) -> Dict:
    """Create metadata dict."""
    video_dark_flag = gray_max < threshold
    return {"gray_max": gray_max, "video_dark_flag": video_dark_flag, "flagged": video_dark_flag}


def _reject(matches, discarded):
    """Reject discarded matches."""
    for query, match, distance in matches:
        if query not in discarded and match not in discarded:
            query, match = _order_match(query, match)
            yield query, match, distance


def _order_match(query_key: ReprKey, match_key: ReprKey):
    """Order match and query file keys"""
    if query_key.path <= match_key.path:
        return query_key, match_key
    return match_key, query_key


def _entry(match):
    """Flatten (query_key, match_key, dist) match entry."""
    query, match, dist = match
    return query.path, query.hash, match.path, match.hash, dist


def _save_matches_csv(matches, path):
    """Save matches to csv file."""
    dataframe = pd.DataFrame(
        tuple(_entry(match) for match in matches),
        columns=[
            "query_video",
            "query_sha256",
            "match_video",
            "match_sha256",
            "distance",
        ],
    )
    dataframe.to_csv(path)


def _save_metadata_csv(metadata: Dict[ReprKey, Dict], path):
    """Save metadata to csv file."""
    keys, metas = map(tuple, zip(*metadata.items()))
    keys = tuple(map(asdict, keys))
    dataframe = pd.DataFrame(metas)
    dataframe = dataframe.merge(pd.DataFrame(keys), left_index=True, right_index=True)
    dataframe.to_csv(path)
