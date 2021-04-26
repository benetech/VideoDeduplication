import os

import click

from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.process_url import process_url
from winnow.utils.config import resolve_config
from winnow.utils.logging import configure_logging_cli


@click.command()
@click.option("--url", "-u", help="URL of the video that will be processed")
@click.option("--output", "-o", help="output template inside the dataset directory", default="%(title)s.%(ext)s")
@click.option("--config", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
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
def main(url, output, config, frame_sampling, save_frames):
    """Entry point for processing video by URL."""
    logger = configure_logging_cli()
    logger.info("Loading config file")
    config = resolve_config(config_path=config, frame_sampling=frame_sampling, save_frames=save_frames)

    pipeline = PipelineContext(config)
    process_url(video_url=url, destination=output, pipeline=pipeline)


if __name__ == "__main__":
    main()
