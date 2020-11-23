# Adapted from Deep Metric Learning Project

import numpy as np
import pickle as pk
import matplotlib.pylab as plt
from sklearn.metrics import precision_recall_curve
from scipy.spatial.distance import cdist
import logging

logger = logging.getLogger("winnow")
logger.setLevel(logging.ERROR)
output_file_handler = logging.FileHandler("processing_error.log")
logger.addHandler(output_file_handler)


def load_dataset(dataset):
    """
    Function that loads dataset object.

    Args:
      dataset: dataset name
    Returns:
      dataset object
    """
    return pk.load(open("datasets/{}.pickle".format(dataset), "rb"))


def load_feature_files(feature_files):
    """
    Function that loads the feature directories.

    Args:
      feature_files: file that contains the feature directories
    Returns:
      dictionary that contains the feature directories for each video id
    Raise:
      file is not in the right format
    """
    try:
        return {line.split("\t")[0]: line.split("\t")[1].strip() for line in open(feature_files, "rb").readlines()}
    except Exception:
        raise Exception(
            """--feature_files provided is in wrong format. Each line of the
        file have to contain the video id (name of the video file)
        and the full path to the corresponding .npy file, separated
        by a tab character (\\t). Example:[VIDEO_ID]	features/[VIDEOID].npy"""
        )


def normalize(X):
    """
    Function that apply zero mean and l2-norm to every vector.

    Args:
      X: input feature vectors
    Returns:
      the normalized vectors
    """
    X -= X.mean(axis=1, keepdims=True)
    X /= np.linalg.norm(X, axis=1, keepdims=True) + 1e-15
    return X


def global_vector_from_tensor(video_tensor):
    try:
        X = video_tensor
        X = normalize(X)
        X = X.mean(axis=0, keepdims=True)
        X = normalize(X)
        return X
    except Exception:
        print("Error processing video tensor.")
        return np.array([])


def global_vector(frame_feature_vector):
    """
    Function that calculate the global feature vector from the
    frame features vectors. First, all frame features vectors
    are normalized, then they are averaged on each dimension to
    produce the global vector, and finally the global vector is
    normalized again.

    Args:
      frame_feature_vector: path to feature file of a video
    Returns:
      X: the normalized global feature vector
    """
    try:
        X = frame_feature_vector
        X = normalize(X)
        X = X.mean(axis=0, keepdims=True)
        X = normalize(X)
        return X
    except Exception:
        print("Error processing video tensor.")
        return np.array([])


def frame_to_global(representations):
    """
    Calculate and save global feature vectors based on frame-level
    representation.

    Args:
        representations (winnow.storage.repr_storage.ReprStorage):
        Intermediate representations storage.
    """
    for key in representations.frame_level.list():
        try:

            frame_feature_vector = representations.frame_level.read(key)

            video_representation = global_vector(frame_feature_vector)
            representations.video_level.write(key, video_representation)
        except Exception as e:

            logger.error(f"Error processing file:{key}")
            logger.error(e)


def plot_pr_curve(pr_curve, title):
    """
    Function that plots the PR-curve.

    Args:
      pr_curve: the values of precision for each recall value
      title: the title of the plot
    """
    plt.figure(figsize=(16, 9))
    plt.plot(np.arange(0.0, 1.05, 0.05), pr_curve, color="b", marker="o", linewidth=3, markersize=10)
    plt.grid(True, linestyle="dotted")
    plt.xlabel("Recall", color="k", fontsize=27)
    plt.ylabel("Precision", color="k", fontsize=27)
    plt.yticks(color="k", fontsize=20)
    plt.xticks(color="k", fontsize=20)
    plt.ylim([0.0, 1.05])
    plt.xlim([0.0, 1.0])
    plt.title(title, color="k", fontsize=27)
    plt.tight_layout()
    plt.show()


def calculate_similarities(queries, features):
    """
    Function that generates video triplets from CC_WEB_VIDEO.

    Args:
      queries: indexes of the query videos
      features: global features of the videos in CC_WEB_VIDEO
    Returns:
      similarities: the similarities of each query with the videos in the dataset
    """

    features = features[0]
    similarities = dict()
    dist = np.nan_to_num(cdist(features[queries], features, metric="euclidean"))
    for i, v in enumerate(queries):
        sim = np.round(1 - dist[i] / dist.max(), decimals=6)
        similarities[i + 1] = [(s, sim[s]) for s in sim.argsort()[::-1] if not np.isnan(sim[s])]
    return similarities


def evaluate(ground_truth, similarities, positive_labels="ESLMV", all_videos=False):
    """
    Function that plots the PR-curve.

    Args:
      ground_truth: the ground truth labels for each query
      similarities: the similarities of each query with the videos in the
      dataset
      positive_labels: labels that are considered positives
      all_videos: indicator of whether all videos are considered for the
      evaluation or only the videos in the query subset
    Returns:
      mAP: the mean Average Precision
      ps_curve: the values of the PR-curve
    """
    pr, mAP = [], 0.0
    for query_set, labels in ground_truth.items():
        i = 0.0
        ri = 0
        s = 0.0
        y_target, y_score = [], []
        for video, sim in similarities[query_set]:
            if all_videos or video in labels:
                y_score += [sim]
                y_target += [0.0]
                ri += 1
                if video in labels and labels[video] in positive_labels:
                    i += 1.0
                    s += i / ri
                    y_target[-1] = 1.0

        mAP += s / np.sum([1.0 for label in labels.values() if label in positive_labels])

        precision, recall, thresholds = precision_recall_curve(y_target, y_score)
        p = []
        for i in range(20, 0, -1):
            idx = np.where((recall >= i * 0.05))[0]
            p += [np.max(precision[idx])]
        pr += [p + [1.0]]

    return mAP / len(ground_truth), np.mean(pr, axis=0)[::-1]
