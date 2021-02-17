import os

import click

from winnow.pipeline.generate_remote_matches import generate_remote_matches
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.utils.config import resolve_config
from winnow.utils.logging import configure_logging_cli


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
@click.option(
    "--repo",
    "-r",
    help="remote repository name",
    default=None,
)
@click.option(
    "--contributor",
    help="remote contributor name",
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
def main(repo, contributor, config, frame_sampling, save_frames):
    logger = configure_logging_cli()
    logger.info("Loading config file")
    config = resolve_config(config_path=config, frame_sampling=frame_sampling, save_frames=save_frames)
    generate_remote_matches(repository_name=repo, contributor_name=contributor, pipeline=PipelineContext(config))


if __name__ == "__main__":
    main()
