import logging
import os
from time import time
from typing import Collection, Dict, Iterable, Set

import pandas as pd
from dataclasses import asdict, replace
from tqdm import tqdm

from winnow.duplicate_detection.neighbors import  DetectedMatch
from winnow.duplicate_detection.neighbors_rapids import NeighborMatcher
from winnow.pipeline.extract_video_level_features import video_features_exist, extract_video_level_features
from winnow.pipeline.extract_video_signatures import video_signatures_exist, extract_video_signatures
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.pipeline.store_database_signatures import database_signatures_exist, store_database_signatures
from winnow.storage.file_key import FileKey
from winnow.storage.repr_utils import bulk_read
from winnow.utils.brightness import get_brightness_estimation
from winnow.utils.files import get_hash
from winnow.utils.neighbors import as_vectors

# Default module logger
logger = logging.getLogger(__name__)


def generate_local_matches(
    files: Collection[str], pipeline: PipelineContext, hashes=None, progress=ProgressMonitor.NULL
):
    """Find matches between video files."""

    files = tuple(files)
    config = pipeline.config
    if hashes is None:
        hashes = [get_hash(file, config.repr.hash_mode) for file in files]

    # There is no way to check if matches are already generated.
    # Hence we must always attempt to generate matches.

    # Ensure dependencies are satisfied
    if not video_features_exist(files, pipeline) and config.proc.filter_dark_videos:
        extract_video_level_features(files, pipeline, progress=progress.subtask(0.9))
        progress = progress.subtask(0.1)
    if not video_signatures_exist(files, pipeline):
        extract_video_signatures(files, pipeline, progress=progress.subtask(0.7))
        progress = progress.subtask(0.3)
    if not database_signatures_exist(files, pipeline):
        store_database_signatures(files, pipeline, progress=progress.subtask(0.2))
        progress = progress.subtask(0.8)

    logger.info("Starting match detection for %s files", len(files))

    # Load signatures
    all_signatures = bulk_read(pipeline.repr_storage.signature)
    req_signatures = bulk_read(pipeline.repr_storage.signature, select=map(pipeline.filekey, files))

    # Do find matches
    start_time = time()
    neighbor_matcher = NeighborMatcher(haystack=as_vectors(all_signatures))
    matches = neighbor_matcher.find_matches(needles=as_vectors(req_signatures), max_distance=config.proc.match_distance)
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
        file_keys = tuple(map(pipeline.filekey, files))
        brightness = {key: get_brightness_estimation(video_features.read(key)) for key in tqdm(file_keys)}

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


def _reject(detected_matches: Iterable[DetectedMatch], discarded: Set[FileKey]):
    """Reject discarded matches."""
    for match in detected_matches:
        if match.needle_key not in discarded and match.haystack_key not in discarded:
            yield _order_match(match)


def _order_match(match: DetectedMatch):
    """Order match and query file keys"""
    if match.haystack_key.path <= match.needle_key.path:
        return replace(match, haystack_key=match.needle_key, needle_key=match.haystack_key)
    return match


def _entry(detected_match: DetectedMatch):
    """Flatten (query_key, match_key, dist) match entry."""
    query, match = detected_match.needle_key, detected_match.haystack_key
    return query.path, query.hash, match.path, match.hash, detected_match.distance


def _save_matches_csv(matches: Iterable[DetectedMatch], path):
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


def _save_metadata_csv(metadata: Dict[FileKey, Dict], path):
    """Save metadata to csv file."""
    keys, metas = map(tuple, zip(*metadata.items()))
    keys = tuple(map(asdict, keys))
    dataframe = pd.DataFrame(metas)
    dataframe = dataframe.merge(pd.DataFrame(keys), left_index=True, right_index=True)
    dataframe.to_csv(path)
