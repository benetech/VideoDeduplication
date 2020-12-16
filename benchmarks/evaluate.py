import pandas as pd
from glob import glob
from utils import evaluate_augmented_dataset, evaluate_landmarks
import os
from winnow.utils.config import resolve_config
import click
import numpy as np
import json

pd.options.mode.chained_assignment = None


@click.command()
@click.option("--benchmark", "-b", help="name of the benchmark to evaluated", default="augmented_dataset")
@click.option(
    "--force-download",
    "-fd",
    help="Force download of the dataset (even if an existing directory for the dataset has been detected",
    default=False,
    is_flag=True,
)
@click.option(
    "--overwrite",
    "-o",
    help="Force feature extraction, even if we detect that signatures have already been processed.",
    default=False,
    is_flag=True,
)
def main(benchmark, force_download, overwrite):

    config_path = os.path.join("benchmarks", benchmark, "config.yml")
    config = resolve_config(config_path)

    if benchmark == "augmented_dataset":

        evaluate_augmented_dataset(config, force_download, overwrite, config_path)

    elif benchmark == "landmarks":

        evaluate_landmarks(config, force_download, overwrite, config_path)

    else:

        print(f"Please review the dataset (@ {config.sources.root})")


if __name__ == "__main__":

    main()
