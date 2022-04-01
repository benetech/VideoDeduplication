import logging.config
import os

import click
import luigi

from winnow.pipeline.luigi.matches import (
    MatchesReportTask,
    MatchesByFileListTask,
    DBMatchesTask,
    DBMatchesByFileListTask,
)
from winnow.utils.config import resolve_config


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
@click.option(
    "--list-of-files",
    "-lof",
    help="path to txt with a list of files for processing - overrides source folder from the config file",
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
def main(config, list_of_files, frame_sampling, save_frames):
    config = resolve_config(config_path=config, frame_sampling=frame_sampling, save_frames=save_frames)
    logging.config.fileConfig("./logging.conf")

    if list_of_files is None:
        luigi.build(
            [MatchesReportTask(config=config), DBMatchesTask(config=config)],
            local_scheduler=True,
            workers=1,
        )
    else:
        luigi.build(
            [
                MatchesByFileListTask(config=config, path_list_file=list_of_files),
                DBMatchesByFileListTask(config=config, path_list_file=list_of_files),
            ],
            local_scheduler=True,
            workers=1,
        )


if __name__ == "__main__":
    main()
