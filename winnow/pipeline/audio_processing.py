import os
import time
import warnings
import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from joblib import Parallel, delayed
from tensorflow.keras.models import load_model
from winnow.utils.network import download_file
import cv2
import librosa
import logging

logger = logging.getLogger(__name__)

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

####################################
# Globals
ALLOWED_VIDEO_FILE_TYPES = {"webm", "wav", "mp4"}

SPECTROGRAM_DURATION = 3  # extract spectrogram from audio file. Each slice of spectrogram is 2 seconds
STRIDE = 2
# parameters for spectrogram vector
NCOL, NROW = 224, 224
PREFIX = "spec_224x224"

LABEL_TO_NAME_MAP = {
    1: "Cluster_Munitions",
    2: "Explosion",
    3: "Cannon",
    4: "Missile",
    5: "TOW_Missile",
    6: "Shooting_at_protests",
    7: "Machine_Gun",
    8: "Gunshots",
    9: "Fusillade",
    10: "Artillery_fire",
    11: "Siren",
    12: "Aircraft",
    13: "Human_Speech",
    14: "Human_Scream",
    15: "Music",
}


def predict_all(X, clipnames, model):

    results = []
    clip_times = np.asarray([(fname.split("@")[1]).replace(".wav", "") for fname in clipnames])

    y_preds = model.predict(X, verbose=1)

    for model_idx in range(len(y_preds)):
        y_pred = y_preds[model_idx]
        model_name = str(model_idx + 1)
        pos_idx = np.where(y_pred >= 0.5)[0]
        if len(pos_idx) > 0:
            for cl in pos_idx:
                video_file = (clipnames[cl].split("/")[-1]).split("@")[0]
                results.append([video_file, LABEL_TO_NAME_MAP[int(model_name)], clip_times[cl]])
    return results


def process_file(fn, top_db=80.0, convert_to_BGR=False):

    file_name = os.path.basename(fn)
    file_name_no_ext = ".".join(file_name.split(".")[:-1])

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        audio, sr = librosa.load(fn, sr=None)
    audio_len = int(np.ceil(audio.shape[0] / sr))  # length of audio rounded up (ceiling) to the nearest second

    x_single = []
    clip_names = []
    for start_second in range(0, audio_len + 1 - SPECTROGRAM_DURATION, STRIDE):
        end_second = start_second + SPECTROGRAM_DURATION
        i1 = start_second * sr
        i2 = end_second * sr

        clip_name = "%s@%d_%d" % (file_name_no_ext, start_second, end_second)
        clip = audio[i1:i2]

        S = librosa.feature.melspectrogram(y=clip, sr=sr)
        S_db = librosa.power_to_db(S, ref=np.max, top_db=top_db)
        norm_S_db = (S_db[::-1, :] + top_db) / top_db  # flip array vertically, and normalize to [0,1] range

        cmap = plt.get_cmap("magma")
        img = cmap(norm_S_db, bytes=True)[:, :, 0:3]  # convert to RGBA image and drop the alpha channel
        img = cv2.resize(img, (NCOL, NROW))

        # To match the original pipeline, convert this image from RGB to BGR, which is how cv2.imread works by default
        if convert_to_BGR:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

        x_single.append(img)
        clip_names.append(clip_name)

    return x_single, clip_names


def run_audio_pipeline(videos, model_fn="data/audio_model.h5", num_cores=5, output_dir="data/"):

    if not os.path.exists(model_fn):

        logger.info("Downloading audio processing model")

        download_file(model_fn, url="https://justiceai.s3.amazonaws.com/audio_model.h5")

    output_dir = os.path.join(output_dir, "audio_processing")

    ####################################
    # Setup directories / input sanity checks
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    ####################################
    # Load models
    start_time = time.time()
    model = load_model(model_fn)
    print("[TIME MODEL LOADING] time taken: %0.4f seconds" % (time.time() - start_time))
    all_start_time = time.time()

    ####################################
    # Featurize audio
    start_time = time.time()

    # search `input_dir` for all filenames that have an extension in `ALLOWED_VIDEO_FILE_TYPES`
    all_fns = []

    for fn in videos:
        if fn.split(".")[-1] in ALLOWED_VIDEO_FILE_TYPES:
            all_fns.append(fn)

    # extract features from all the files that we found
    x_all = []
    all_clip_names = []
    spectrograms_and_filenames = Parallel(n_jobs=num_cores)(delayed(process_file)(filename) for filename in all_fns)
    if len(spectrograms_and_filenames) == 0:
        print("Nothing to do here! No spectrograms found...")
        return
    x_all, all_clip_names = zip(*[(x, y) for (x, y) in spectrograms_and_filenames if len(x) > 0])
    all_clip_names = [y for x in all_clip_names for y in x]
    x_all = np.concatenate(x_all, axis=0)

    print("[TIME FEATURIZATION] time taken: %0.4f seconds" % (time.time() - start_time))

    ####################################
    # Generate results
    start_time = time.time()
    results = predict_all(x_all, all_clip_names, model)
    print("[TIME MODEL INF] Time taken: %0.4f seconds" % (time.time() - start_time))
    print("[TOTAL TIME] Total time taken: %0.4f seconds" % (time.time() - all_start_time))

    ####################################
    # Save results
    results = pd.DataFrame(results, columns=["Video-name", "Class", "Time (secs)"])
    save_fp = os.path.join(output_dir, "results.csv")
    results.to_csv(save_fp)
    logger.info(f"Results saved to:{save_fp}")
