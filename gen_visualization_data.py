import click
import numpy as np
from glob import glob
import os
from winnow.utils.matches import get_summarized_matches, unique
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from winnow.feature_extraction.utils import load_video
from sklearn.cluster import DBSCAN
from sklearn.manifold import TSNE
from tqdm import tqdm
from sklearn.decomposition import PCA


def extract_label(fp):
    try:
        return fp.split("/")[-2]
    except:
        return "No label available"


# "data/vcdb/video_level"


def get_original_fp(source_video, path, start="data/"):
    return os.path.join(source_video, os.path.relpath(path, start=start).replace(".npy", ""))


def get_rel_path_summary(DST_FRAMES, path, start):

    dst = os.path.join(DST_FRAMES, os.path.basename(path) + ".jpg")
    relpath = os.path.relpath(
        dst,
        start=start,
    )
    return relpath


@click.command()
@click.option(
    "--source",
    "-s",
    help="path to the folder that contains signatures",
    default="data/representations/video_signatures",
)
@click.option("--output", "-o", help="path to the output folder where the files will be saved", default="data/")
@click.option(
    "--save-summaries",
    "-ss",
    help="Whether to save frame summaries for each video so they can be displayed by a client",
    default=None,
    is_flag=True,
)
@click.option(
    "--source-videos",
    "-sv",
    help="path to the folder that contains the original videos",
    default="data",
)
def main(source, output, save_summaries, source_videos):

    assert os.path.exists(source), "Source folder does not exist"
    assert os.path.exists(output), "Output folder does not exist"

    files = glob(os.path.join(source, "**/**.npy"), recursive=True)
    print(f"{len(files)} files found")
    video_data = []
    loaded_files = []
    for file in files:
        try:
            video_data.append(np.nan_to_num(np.load(file)[0]))
            loaded_files.append(file)
        except Exception as e:
            print("Error processing:", file, e)

    pca = PCA()
    print(sum(np.isnan(video_data)))
    video_data_pca = pca.fit_transform(video_data)
    ts = TSNE(perplexity=50, n_iter=5000, learning_rate=10).fit_transform(video_data_pca)
    dbs = DBSCAN(eps=1.8, metric="euclidean", min_samples=5)
    clusters = dbs.fit_predict(ts)
    df = pd.DataFrame(dict(files=loaded_files, cluster=clusters))
    df["original_fp"] = df["files"].apply(lambda x: get_original_fp(source_videos, x, start=source))
    df["label"] = df["original_fp"].apply(extract_label)
    df["x"] = ts[:, 0]
    df["y"] = ts[:, 1]

    if save_summaries:
        dst_path = os.path.join(output, "frame_summaries")
        try:
            os.makedirs(dst_path)
        except Exception as e:
            print(e)
        for i, row in tqdm(df.iterrows()):

            try:

                dst = os.path.join(
                    dst_path,
                    os.path.basename(row["original_fp"]) + ".jpg",
                )
                frame_summary_data = np.hstack(load_video(row["original_fp"], 224, 1)[:5])

                plt.imsave(dst, frame_summary_data)
            except Exception as e:

                print("Error saving frame summaries for:", row["original_fp"], e)

        df["summary_path"] = df["original_fp"].apply(
            lambda x: os.path.basename(x) + ".jpg",
        )

    dst_file_output = os.path.join(output, "data.json")
    df.to_json(os.path.join(output, "data.json"), orient="index")
    print("Saved data.json file to", dst_file_output)


if __name__ == "__main__":
    main()
