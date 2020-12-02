import os

import numpy as np
from joblib import load

DEFAULT_DIRECTORY = os.path.join(os.path.dirname(__file__), "models")
GRAY_ESTIMATION_MODEL = os.path.join(DEFAULT_DIRECTORY, "gb_gray_model.joblib")


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
