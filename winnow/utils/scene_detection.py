import datetime
import logging
from typing import List, Sequence

import matplotlib.pyplot as plt
import numpy as np
from dataclasses import dataclass
from scipy.spatial.distance import cosine

from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey

logger = logging.getLogger(__name__)


def cosine_series(arr):
    output = [1.0]
    for i in range(len(arr)):
        if i < len(arr) - 1:
            a = arr[i]
            b = arr[i + 1]
            dist = cosine(a, b)
            output.append(dist)
    return np.array(output)


def visualize_frames(fp, diffs=None):
    video = np.load(fp)
    if diffs is not None:
        frames_idx = (diffs > np.quantile(diffs, 0.90)) & (diffs > 0.05)
        sample_frames = video[frames_idx]
    else:
        sample_frames = video[0::1, :, :, :]
    plot = sum(frames_idx) >= 3

    if plot:

        plt.figure(figsize=(10, 10))
        plt.imshow(np.hstack(sample_frames))
        plt.show()

        plt.figure(figsize=(5, 5))
        plt.plot(list(range(len(diffs))), diffs)
        plt.plot(list(range(len(diffs))), diffs * frames_idx, "bo")
        plt.show()


def naive_diff(arr):
    diffs = np.diff(arr)
    sdiffs = np.absolute(np.sum(diffs, axis=1)) ** 24
    return np.insert(sdiffs, 0, [1])


def visualize_features(fp, diff_function=cosine_series):
    nfp = fp.replace("frames", "features")
    feats = np.load(nfp)
    sdiffs = diff_function(feats)

    return sdiffs


def visualize_vid(fp):
    sdiffs = visualize_features(fp)
    visualize_frames(fp, diffs=sdiffs)


def get_duration(scenes):
    return [y - x for x, y in scenes]


def seconds_to_time(list_of_durations):

    results = []
    for i, n in enumerate(list_of_durations):

        n = int(n)

        if i == 0:
            start_time = datetime.timedelta(seconds=0)
            end_time = datetime.timedelta(seconds=n)
        else:
            start_time = end_time
            end_time = start_time + datetime.timedelta(seconds=n)

        results.append((str(start_time), str(end_time)))

    return results


@dataclass
class SceneExtractionResults:
    """Data structure to hold scene extraction results."""

    # List of original file paths inside content folder
    path: List[str] = None

    # List of original files sha256 hash digests
    hash: List[str] = None

    # List of lists containing duration (in seconds) of each scene where List
    # i corresponds to filtered_video[i]
    scene_duration_seconds: List[List[int]] = None

    # List of total video duration
    video_duration_seconds: List[int] = None


def filter_short_scenes(scene_duration_list, min_duration=2):

    adj = []
    buffer = 0
    for scene in scene_duration_list:
        if scene > min_duration:
            scene += buffer
            adj.append(scene)
            buffer = 0

        else:
            buffer += scene
    return adj


def frame_iterator(keys, repr_storage: BaseReprStorage):
    for key in keys:
        try:
            path = key.path
            file_hash = key.hash
            features = repr_storage.read(key)
            yield path, file_hash, features
        except Exception as e:
            logger.error("Error processing: %s - %s", key, e)


def extract_scenes(
    file_keys: Sequence[FileKey],
    frame_features_storage: BaseReprStorage,
    minimum_duration: int = 10,
    upper_thresh: float = 0.793878,
    min_dif: float = 0.04,
    min_scene_duration: int = 2,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
) -> SceneExtractionResults:
    """
    Extracts scenes from a list of files

    Args:
        file_keys (Sequence[FileKey]): List of repr keys containing path to its frame-level features and hash.
        frame_features_storage (BaseReprStorage): Frame-level features repr storage.
        minimum_duration (int): Minimum duration of video in seconds (default: {10})
        upper_thresh (float):
        min_dif (float):
        min_scene_duration (int): minimal scene duration in seconds
        progress: progress monitor

    Returns:
        SceneExtractionResults: Data structure containing complete scene
        extraction results.
    """
    # Filter videos by duration
    frame_level_iterator = frame_iterator(file_keys, frame_features_storage)
    progress.scale(total_work=len(file_keys), unit="files")

    raw_scenes = []
    paths = []
    hashes = []

    for path, file_hash, frame_level_features in frame_level_iterator:
        if frame_level_features.shape[0] > minimum_duration:
            raw_scenes.append(cosine_series(frame_level_features))
            paths.append(path)
            hashes.append(file_hash)
        progress.increase(1)

    scene_ident = [((diffs > np.quantile(diffs, upper_thresh)) & (diffs > min_dif)) for diffs in raw_scenes]

    video_scenes = []
    for sid in scene_ident:
        idxs = np.array(list(range(len(sid))))[sid]
        scenes = []
        for z, i in enumerate(idxs):
            start = i
            if z == (len(idxs) - 1):
                end = len(sid) - 1
            else:
                end = idxs[z + 1]
            scenes.append([start, end])
        video_scenes.append(scenes)

    results = SceneExtractionResults()
    results.path = paths
    results.hash = hashes
    results.scene_duration_seconds = [get_duration(x) for x in video_scenes]
    results.scene_duration_seconds = [
        filter_short_scenes(x, min_scene_duration) for x in results.scene_duration_seconds
    ]
    results.scenes_timestamp = [seconds_to_time(d) for d in results.scene_duration_seconds]
    results.num_scenes = [len(x) for x in video_scenes]
    results.avg_duration_seconds = [np.mean(x) for x in results.scene_duration_seconds]
    results.video_duration_seconds = [sid.shape[0] for sid in scene_ident]
    results.total_video_duration_timestamp = [datetime.timedelta(seconds=x) for x in results.video_duration_seconds]

    progress.complete()
    return results
