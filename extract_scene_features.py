import os

import click

from winnow.pipeline.extract_scene_signatures import extract_scene_signatures
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.detect_scenes import detect_scenes
from winnow.utils.config import resolve_config
from winnow.utils.files import scan_videos, scan_videos_from_txt
from winnow.utils.logging import configure_logging_cli


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
    logger = configure_logging_cli()
    logger.info("Loading config file")
    config = resolve_config(config_path=config, frame_sampling=frame_sampling, save_frames=save_frames)

    logger.info("Searching for Dataset Video Files")
    if list_of_files is None:
        videos = scan_videos(config.sources.root, "**", extensions=config.sources.extensions)
    else:
        videos = scan_videos_from_txt(list_of_files, extensions=config.sources.extensions)

    pipeline = PipelineContext(config)
    detect_scenes(files=videos, pipeline=pipeline)
    extract_scene_signatures(files=videos, pipeline=pipeline)


if __name__ == "__main__":
    main()
