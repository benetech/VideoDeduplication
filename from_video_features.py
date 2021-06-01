import click
from glob import glob
import os
import numpy as np
from winnow.feature_extraction import SimilarityModel
from tqdm import tqdm


@click.command()
@click.option(
    "--source", "-s", help="path to the folder that contains source videos", default="data/representations/video_level"
)
@click.option("--output", "-o", help="path to the output folder where the files will be saved", default=None)
@click.option("--validate", "-v", help="Whether to validate results at the end", default=None, is_flag=True)
def main(source, output, validate):

    assert os.path.exists(source), "Source folder does not exist"
    # assert os.path.exists(output), "Output folder does not exist"

    video_level_features_fp = glob(os.path.join(source, "**/*.npy"), recursive=True)

    print(f"Number of compatible files fount at {source}: {len(video_level_features_fp)}")

    sm = SimilarityModel()

    for fp in tqdm(video_level_features_fp, desc="Converting video_level features into signatures"):

        try:
            # Dst path is the same as the source (relative to the parent folder)
            dst = os.path.join(output, os.path.relpath(fp, start=source))
            video_level_features = np.load(fp)
            signature = sm.predict_from_features(video_level_features)[0]
            if not os.path.exists(os.path.dirname(dst)):
                os.makedirs(os.path.dirname(dst))
            np.save(dst, signature)
        except Exception as e:
            print(f"Error processing file:{fp}", e)

    if validate:
        generated_signatures = glob(os.path.join(output, "**/**.npy"), recursive=True)

        for x in generated_signatures:
            sig = np.load(x)
            assert sig.shape == (500,)

        print(f"Number of generated signatures:{len(generated_signatures)}")
        print(f"Number of source_files:{len(generated_signatures)}")


if __name__ == "__main__":
    main()
