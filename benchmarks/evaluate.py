import pandas as pd
from glob import glob
from utils import get_result, download_dataset, get_frame_sampling_permutations
import os
from winnow.utils.config import resolve_config
import click
from winnow.utils import scan_videos
import subprocess
import shlex
import numpy as np
import json

pd.options.mode.chained_assignment = None

@click.command()

@click.option(
    '--benchmark', '-b',
    help='name of the benchmark to evaluated',
    default='augmented_dataset')

@click.option(
    '--force-download', '-fd',
    help='Force download of the dataset (even if an existing directory for the dataset has been detected',
    default=False, is_flag=True)

@click.option(
    '--overwrite', '-o',
    help='Force feature extraction, even if we detect that signatures have already been processed.',
    default=False, is_flag=True)


def main(benchmark, force_download, overwrite):

    config_path = os.path.join('benchmarks', benchmark, 'config.yml')
    config = resolve_config(config_path)
    source_folder = config.sources.root

    videos = scan_videos(source_folder, '**')

    if len(videos) == 0 or force_download:

        download_dataset(source_folder, url='https://winnowpre.s3.amazonaws.com/augmented_dataset.tar.xz')

        videos = scan_videos(source_folder, '**')

        print(f'Videos found after download:{len(videos)}')

    if len(videos) > 0:

        print('Video files found. Checking for existing signatures...')

        signatures_path = os.path.join(
                                    config.repr.directory,
                                    'video_signatures', '**',
                                    '**.npy')

        signatures = glob(os.path.join(signatures_path), recursive=True)

        if len(signatures) == 0 or overwrite:

            # Load signatures and labels
            #
            command = f'python extract_features.py -cp {config_path}'
            command = shlex.split(command)
            subprocess.run(command, check=True)

        # Check if signatures were generated properly
        signatures = glob(os.path.join(signatures_path), recursive=True)

        assert len(signatures) > 0, 'No signature files were found.'

        available_df = pd.read_csv(
                                os.path.join(
                                            'benchmarks',
                                            benchmark,
                                            'labels.csv'))
        frame_level = glob(
                        os.path.join(
                                    config.repr.directory,
                                    'frame_level', '**',
                                    '**.npy'), recursive=True)

        signatures_permutations = get_frame_sampling_permutations(
                                                        list(range(1, 6)),
                                                        frame_level)

        scoreboard = dict()

        for fs, sigs in signatures_permutations.items():

            results_analysis = dict()

            for r in np.linspace(0.1, 0.25, num=10):

                results = []

                for i in range(5):

                    mAP, pr_curve = get_result(
                                            available_df,
                                            sigs,
                                            ratio=r,
                                            file_index=frame_level)
                    results.append(mAP)

                results_analysis[r] = results

            scoreboard[fs] = results_analysis

        results_file = open('benchmarks/scoreboard.json', "w")
        json.dump(scoreboard, results_file)
        print('Saved scoreboard on {}'.format('benchmarks/scoreboard.json'))

    else:

        print(f'Please review the dataset (@ {source_folder})')
    
if __name__ == '__main__':

    main()
