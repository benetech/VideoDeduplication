import hashlib
import json
import os

import cv2
import numpy as np
from joblib import load

from winnow.storage.repr_key import ReprKey
from winnow.storage.repr_utils import path_resolver
from winnow.utils.files import get_hash

DEFAULT_DIRECTORY = os.path.join(os.path.dirname(__file__), "models")
GRAY_ESTIMATION_MODEL = os.path.join(DEFAULT_DIRECTORY, "gb_gray_model.joblib")


def filter_results(thr, distances, indices):
    results = []
    results_distances = []
    msk = distances < thr
    for i, r in enumerate(msk):
        results.append(indices[i, r])
        results_distances.append(distances[i, r])
    return results, results_distances


def uniq(row):

    return "".join([str(x) for x in sorted([row["query"], row["match"]])])


def load_gray_estimation_model():
    """
     Loads pretrained gray_max estimation model. This model has been trained
     to estimate the maximum level of brightness detected within all sampled
     frames of a video from the video-level features. The model was optimized
     to maximize precision instead of recall (so less false positives would
     be filtered out).

    Returns:
        Scikit-learn[Estimator]: A pretrained GB model
    """
    model = load(GRAY_ESTIMATION_MODEL)
    return model


def get_gray_max(video_level_features):

    model = load_gray_estimation_model()
    predictions = model.predict(video_level_features)

    return predictions


def get_brightness_estimation(reps, repr_key):

    vl_features = np.nan_to_num(reps.video_level.read(repr_key))
    estimates = get_gray_max(vl_features)

    return estimates


def extract_additional_info(reps, repr_key):
    """
    Extract file metadata.
    Args:
        reps (winnow.storage.repr_storage.ReprStorage): Intermediate
            representation storage.
        repr_key (winnow.storage.repr_key.ReprKey): Representation
            storage key.
    """
    v = reps.frame_level.read(repr_key)
    frames = reps.frames.read(repr_key)
    grays = np.array([cv2.cvtColor(x, cv2.COLOR_BGR2GRAY) for x in frames])
    grays = np.array([np.mean(x) for x in grays])

    grays_avg = np.mean(grays, axis=0)
    grays_std = np.std(grays, axis=0)
    try:
        grays_max = np.max(grays)
    except Exception:
        grays_max = 0

    shape = v.shape
    intra_sum = np.sum(v, axis=1)
    mean_act = np.mean(intra_sum)
    try:

        max_dif = np.max(intra_sum) - np.min(intra_sum)

    except Exception:
        max_dif = 0
    std_sum = np.std(intra_sum)

    return (shape[0], mean_act, std_sum, max_dif, grays_avg, grays_std, grays_max)


def get_config_tag(config):
    """Get configuration tag.

    Whenever configuration changes making the intermediate representation
    incompatible the tag value will change as well.
    """

    # Configuration attributes that affect representation value
    config_attributes = dict(frame_sampling=config.proc.frame_sampling)

    sha256 = hashlib.sha256()
    sha256.update(json.dumps(config_attributes).encode("utf-8"))
    return sha256.hexdigest()[:40]


def reprkey_resolver(config):
    """Create a function to get intermediate storage key and tags by the file path.

    Args:
        config (winnow.config.Config): Pipeline configuration.
    """

    storepath = path_resolver(config.sources.root)
    config_tag = get_config_tag(config)

    def reprkey(path):
        """Get intermediate representation storage key."""
        return ReprKey(path=storepath(path), hash=get_hash(path), tag=config_tag)

    return reprkey
