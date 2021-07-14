import json
import os
import shlex
import shutil
import subprocess
import time
from collections import defaultdict
from datetime import timedelta
from functools import partial
from glob import glob

import numpy as np
import pandas as pd
from dataclasses import asdict
from sklearn.metrics import homogeneity_completeness_v_measure
from tqdm import tqdm

from winnow.feature_extraction import SimilarityModel
from winnow.feature_extraction import default_model_path
from winnow.feature_extraction.extraction_routine import load_featurizer
from winnow.feature_extraction.loading_utils import evaluate, calculate_similarities, global_vector
from winnow.storage.repr_storage import ReprStorage
from winnow.utils.files import scan_videos
from winnow.utils.network import download_file
from winnow.utils.scene_detection import extract_scenes, filter_short_scenes, seconds_to_time


def get_queries(min_num_of_samples, df, col="original_filename"):

    fc = df[col].value_counts()
    msk = fc >= min_num_of_samples

    return fc[msk].index.values


def get_query_dataset(df, query, ratio=0.22, col="original_filename", col_id="new_filename"):

    msk = df[col] == query
    occ = df.loc[msk, :]
    negative = df.loc[~msk, :]
    n_positive_samples = len(occ)
    positive_head = occ.sample(1)[col_id].values[0]

    query_total = n_positive_samples / ratio
    to_be_sampled = int(query_total - n_positive_samples)
    confounders = negative.sample(to_be_sampled)
    confounders.loc[:, "label"] = "X"
    occ.loc[:, "label"] = "E"
    merged = pd.concat([confounders, occ])

    query_d = dict()

    for i, row in merged.iterrows():

        query_d[row[col_id]] = row["label"]

    return positive_head, query_d


def get_ground_truth(available_df, queries, min_samples=4, ratio=0.2, col="original_filename", col_id="new_filename"):

    ground_truth = dict()

    for query in queries:

        head, query_ds = get_query_dataset(available_df, query, ratio=ratio, col=col, col_id=col_id)

        ground_truth[head] = query_ds

    return ground_truth


def convert_ground_truth(gt, base_to_idx):

    queries = list(gt.keys())

    qi = {base_to_idx[x]: i + 1 for i, x in enumerate(queries)}

    new_ds = dict()

    for k, v in gt.items():

        sub_d = dict()

        for kk, vv in v.items():

            sub_d[base_to_idx[kk]] = vv

        new_ds[qi[base_to_idx[k]]] = sub_d

    return new_ds


def get_result(df, signatures, min_samples=4, ratio=0.25, all_videos=False, file_index=None):

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


def download_dataset(dst, url="https://winnowpre.s3.amazonaws.com/augmented_dataset.tar.xz"):

    if not os.path.exists(dst):

        os.makedirs(dst)

    number_of_files = len(glob(dst + "/**"))
    print("Files Found", number_of_files)

    if number_of_files < 2:

        print("Downloading sample dataset to:{}".format(dst))

        fp = os.path.join(dst, "dataset.tar.gz")
        if not os.path.isfile(fp):

            download_file(fp, url)
        # unzip files
        print("unpacking", fp)
        shutil.unpack_archive(fp, dst)
        # Delete tar
        os.unlink(fp)
    else:
        print("Files have already been downloaded")


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
        signatures[fs].append(sm.predict_from_features(video_level.reshape(video_level.shape[0], video_level.shape[2])))

    return signatures


def batch(iterable, n=1):
    l = len(iterable)
    for ndx in range(0, l, n):
        yield iterable[ndx : min(ndx + n, l)]


def expand_queries(queries, original_df, samples=1):

    msk = original_df.landmark_id.isin(queries)
    available = original_df.loc[msk, :]
    expanded_seed = available.groupby("landmark_id").apply(lambda x: x.sample(samples))
    return expanded_seed


def run_benchmark_on_landmark(
    min_samples, model, n_query_samples=1, int_feats=None, labels=None, ratio=0.3, agg_func=partial(np.mean, axis=0)
):
    if int_feats is None:
        int_feats = np.load("processed_features.npy")
    if labels is None:
        labels = pd.read_csv("clean_landmark_subset.csv")

    print("Loaded Features / DF from scratch")

    queries = get_queries(min_samples, labels, col="landmark_id")
    print(f"Using {len(queries)} queries as base")

    expanded_q = expand_queries(queries, labels, samples=n_query_samples)

    flattened_features = []
    for q in queries:

        qs = expanded_q.loc[q]
        features = int_feats[qs.index]
        features = agg_func(features)
        flattened_features.append(features)

    flattened_features = np.array(flattened_features)

    msk = ~labels.id.isin(expanded_q.id)

    int_feats = int_feats[msk]
    start_q = int_feats.shape[0]
    int_feats = np.append(int_feats, np.array(flattened_features), axis=0)
    end_q = int_feats.shape[0]
    query_indexes = list(range(start_q, end_q))

    query_placeholders = (
        expanded_q.drop(columns="landmark_id")
        .reset_index()
        .groupby("landmark_id")
        .apply(lambda x: x.sample(1))
        .id.values
    )

    merged = pd.concat([labels.loc[msk, :], labels.loc[labels.id.isin(query_placeholders), :]])
    assert int_feats.shape[0] == merged.shape[0]
    assert max(query_indexes) < len(int_feats)
    similarities = calculate_similarities(query_indexes, [int_feats])
    ground_truth = get_ground_truth(merged, queries, ratio=ratio, col="landmark_id", col_id="id")
    basename_to_idx = dict(zip(merged["id"], list(range(len(merged)))))
    final_gt = convert_ground_truth(ground_truth, basename_to_idx)
    mAP, pr_curve = evaluate(final_gt, similarities)

    return mAP, pr_curve


def evaluate_augmented_dataset(config, force_download, overwrite, config_path):

    source_folder = config.sources.root
    videos = scan_videos(source_folder, "**")
    print(videos)

    if len(videos) == 0 or force_download:

        download_dataset(source_folder, url="https://justiceai.s3.amazonaws.com/augmented_dataset.tar.xz")

        videos = scan_videos(source_folder, "**")

        print(f"Videos found after download:{len(videos)}")

    if len(videos) > 0:

        print("Video files found. Checking for existing signatures...")

        signatures_path = os.path.join(config.repr.directory, "video_signatures", "**", "**.npy")

        signatures = glob(os.path.join(signatures_path), recursive=True)

        if len(signatures) == 0 or overwrite:

            # Load signatures and labels
            command = f"python extract_features.py -cp {config_path}"
            command = shlex.split(command)
            subprocess.run(command, check=True)

        # Check if signatures were generated properly
        signatures = glob(os.path.join(signatures_path), recursive=True)

        assert len(signatures) > 0, "No signature files were found."

        available_df = pd.read_csv(os.path.join("benchmarks", "augmented_dataset", "labels.csv"))
        frame_level = glob(os.path.join(config.repr.directory, "frame_level", "**", "**.npy"), recursive=True)

        signatures_permutations = get_frame_sampling_permutations(list(range(1, 6)), frame_level)

        scoreboard = dict()

        for fs, sigs in signatures_permutations.items():

            results_analysis = dict()

            for r in np.linspace(0.1, 0.25, num=10):

                results = []

                for i in range(5):

                    mAP, pr_curve = get_result(available_df, sigs, ratio=r, file_index=frame_level)
                    results.append(mAP)

                results_analysis[r] = results

            scoreboard[fs] = results_analysis

        dst_path = os.path.join("data", "scoreboard.json")
        results_file = open(dst_path, "w")
        json.dump(scoreboard, results_file)
        print("Saved scoreboard on {}".format(dst_path))


def evaluate_landmarks(config, force_download, overwrite, config_path):

    source_folder = config.sources.root
    images_fp = os.path.join(source_folder, "landmark_clean.npy")
    labels = os.path.join(source_folder, "landmark_subset_clean_df.csv")
    print(images_fp, not os.path.isfile(images_fp), not os.path.isfile(labels))
    if (not os.path.isfile(images_fp)) or (not os.path.isfile(labels)):
        print(f"Downloading dataset to {source_folder}")
        download_dataset(source_folder, url="https://justiceai.s3.amazonaws.com/landmark_.tar.xz")

    try:
        print("Loading dataset and labels")
        images = np.load(images_fp)
        labels = pd.read_csv(labels)
    except Exception as e:
        print("Problems loading landmark evaluation dataset", e)
        raise ()

    model_path = default_model_path(config.proc.pretrained_model_local_path)
    model = load_featurizer(model_path)

    int_features = []
    for im in tqdm(batch(images, n=1000)):

        f = model.extract(np.array(im), batch_sz=32)
        int_features.append(f)

    int_feats = []
    for mini_batch in int_features:
        for el in mini_batch:
            int_feats.append(el)

    int_feats = np.array(int_feats)

    n_query_samples = list(range(1, 11))
    ratio = np.linspace(0.1, 0.3, num=5)
    min_samples_query = [20, 30, 40, 50]
    agg_funcs = [
        partial(np.mean, axis=0),
        partial(np.min, axis=0),
        partial(np.max, axis=0),
        partial(np.median, axis=0),
    ]
    agg_labels = ["mean", "min", "max", "median"]

    results = []
    for i, agg_func in enumerate(agg_funcs):
        for n_query in n_query_samples:
            for r in ratio:
                for min_sample in min_samples_query:
                    mAP, pr_curve = run_benchmark_on_landmark(
                        min_sample,
                        model,
                        n_query_samples=n_query,
                        int_feats=int_feats,
                        labels=labels,
                        ratio=r,
                        agg_func=agg_func,
                    )
                    results.append((mAP, pr_curve, n_query, r, min_sample, agg_labels[i]))

    dst_path = os.path.join("data", "landmarks_metrics")

    np.save(dst_path, results)

    print("Landmark benchmarks saved to:", dst_path)


def process_scenes(reps, upper_thresh, min_dif):
    # Processes the evaluation dataset "Planet Earth" and returns results as a dataframe
    scenes = extract_scenes(
        reps.frame_level.list(), reps.frame_level, upper_thresh=upper_thresh, min_dif=min_dif, min_scene_duration=1
    )
    scenes_df = pd.DataFrame(asdict(scenes))
    scenes_df["file_id"] = scenes_df["video_filename"].apply(lambda x: int(x.split(".")[0].split("_")[-1]))
    return scenes_df


def process_labels(fp="data/planet_earth/planet_earth/annotations/shots/**.txt"):

    test_labels = glob(fp)
    dfs = [pd.read_csv(x, sep="\t", names=["start", "end"]) for x in test_labels if x != "README.txt"]
    scene_labels = pd.concat(dfs, keys=[int(os.path.basename(x).split(".")[0].split("_")[0]) for x in test_labels])
    scene_labels_seconds = scene_labels / 25
    scene_labels_seconds["length"] = scene_labels_seconds["end"] - scene_labels_seconds["start"]

    return scene_labels_seconds


def convert_to_seconds(timestamp):
    t = time.strptime(timestamp, "%H:%M:%S")
    return int(timedelta(hours=t.tm_hour, minutes=t.tm_min, seconds=t.tm_sec).total_seconds())


def process_row(list_of_scenes):
    start_end = []
    for scene in list_of_scenes:
        s, e = scene
        standard = [convert_to_seconds(s), convert_to_seconds(e)]
        standard.append(standard[-1] - standard[0])
        start_end.append(standard)

    return start_end


def evaluate_video(labels, predicted_scenes, video_id=8):

    sample_video_labels = labels.loc[(video_id,)].values
    bins = []
    counter = 0.0
    for x in sample_video_labels[:, 2]:
        bins.append(counter)
        counter += x

    axis = list(range(1, round(bins[-1])))

    row = predicted_scenes.loc[predicted_scenes.file_id == video_id, ["scenes_timestamp"]].values[0][0]
    list_of_scenes = process_row(row)
    pred_bins = []
    counter = 0.0
    for x in np.array(list_of_scenes)[:, 2]:
        pred_bins.append(counter)
        counter += x

    label_clusters = pd.cut(axis, bins)
    pred_clusters = pd.cut(axis, pred_bins)
    avg_number_scenes = predicted_scenes["num_scenes"].mean()
    avg_scene_duration_seconds = predicted_scenes["avg_duration_seconds"].mean()
    std_scene_duration_seconds = predicted_scenes["avg_duration_seconds"].std()

    h, c, v = homogeneity_completeness_v_measure(label_clusters, pred_clusters)

    return h, c, v, avg_number_scenes, avg_scene_duration_seconds, std_scene_duration_seconds


def run_experiment(reps, upper_thresh=0.90, min_dif=0.05):

    predicted_scenes = process_scenes(reps, upper_thresh, min_dif)
    labels = process_labels()
    results = []
    for i in range(1, 12):
        h, c, v, a, b, d = evaluate_video(labels, predicted_scenes, video_id=i)
        results.append([h, c, v, a, b, d])

    return np.array(results).mean(axis=0)


def pipeline(reps, upper_thresh, min_dif, scene_length, labels):

    # Runs a single benchmark run given the parameters above with minimun changes to the extract scenes code

    predicted_scenes = process_scenes(reps, upper_thresh, min_dif)
    predicted_scenes["scene_duration_seconds"] = predicted_scenes["scene_duration_seconds"].apply(
        lambda x: filter_short_scenes(x, min_duration=scene_length)
    )
    predicted_scenes["num_scenes"] = predicted_scenes["scene_duration_seconds"].apply(lambda x: len(x))
    predicted_scenes["avg_duration_seconds"] = predicted_scenes["scene_duration_seconds"].apply(lambda x: np.mean(x))
    predicted_scenes["std_duration_seconds"] = predicted_scenes["scene_duration_seconds"].apply(lambda x: np.std(x))
    predicted_scenes["scenes_timestamp"] = predicted_scenes["scene_duration_seconds"].apply(
        lambda x: seconds_to_time(x)
    )
    results = []

    for i in range(1, 12):
        h, c, v, a, b, d = evaluate_video(labels, predicted_scenes, video_id=i)
        results.append([h, c, v, a, b, d])

    return np.array(results).mean(axis=0)


def evaluate_scene_detection(config, force_download, overwrite, config_path):

    source_folder = config.sources.root
    videos = scan_videos(source_folder, "**")

    if len(videos) == 0 or force_download:

        download_dataset(
            source_folder, url="https://justiceai.s3.amazonaws.com/scene_detection_evaluation_dataset.tar.xz"
        )

        videos = scan_videos(source_folder, "**")

        print(f"Videos found after download:{len(videos)}")

    if len(videos) > 0:

        print("Video files found. Checking for existing signatures...")

        signatures_path = os.path.join(config.repr.directory, "video_signatures", "**", "**.npy")

        signatures = glob(os.path.join(signatures_path), recursive=True)

        if len(signatures) == 0 or overwrite:

            # Load signatures and labels
            command = f"python extract_features.py -cp {config_path}"
            command = shlex.split(command)
            subprocess.run(command, check=True)

        # Check if signatures were generated properly
        signatures = glob(os.path.join(signatures_path), recursive=True)

        # config = resolve_config(config_path='config.yaml')
        reps = ReprStorage(config.repr.directory)

        labels = process_labels()
        n = 25
        upper_thresh_ranges = np.linspace(0.1, 0.95, num=n)
        min_dif_ranges = np.linspace(0.0, 0.99, num=n)
        scene_length = list(range(1, 5))
        results = []
        for ut in upper_thresh_ranges:
            for md in min_dif_ranges:
                for s in scene_length:
                    try:
                        results.append([ut, md, s, *pipeline(reps, ut, md, s, labels)])
                    except Exception as e:
                        print(e)
                        continue
        report_df = pd.DataFrame.from_records(results)
        report_df.columns = [
            "upper_thresh",
            "min_dif",
            "scene_length",
            "homogeneity",
            "completeness",
            "v_measure",
            "avg_number_scenes",
            "avg_scene_duration_seconds",
            "std_scene_duration_seconds",
        ]

        dst_path = os.path.join("data", "scene_detection_metrics.csv")

        report_df.to_csv(dst_path)
