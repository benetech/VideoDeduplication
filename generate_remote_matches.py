import logging.config
import os

import click
import luigi

from winnow.pipeline.luigi.matches import RemoteMatchesTask
from winnow.utils.config import resolve_config


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
@click.option(
    "--repo",
    "-r",
    help="remote repository name",
    default=None,
)
@click.option(
    "--frame-sampling",
    "-fs",
    help=(
        "Sets the sampling strategy (values from 1 to 10 - eg "
        "sample one frame every X seconds) - overrides frame "
        "sampling from the config file"
    ),
    default=None,
)
@click.option(
    "--save-frames",
    "-sf",
    help="Whether to save the frames sampled from the videos - overrides save_frames on the config file",
    default=None,
    is_flag=True,
)
def main(repo, config, frame_sampling, save_frames):
    config = resolve_config(config_path=config, frame_sampling=frame_sampling, save_frames=save_frames)
    logging.config.fileConfig("./logging.conf")
    luigi.build([RemoteMatchesTask(config=config, repository_name=repo)], local_scheduler=True, workers=1)


if __name__ == "__main__":
    main()
