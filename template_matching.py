import os

import click

from winnow.pipeline.match_templates import match_templates
from winnow.pipeline.pipeline_context import PipelineContext
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
@click.option(
    "--override", "-ovr", help="Overrides the previous template matches saved on the DB", default=None, is_flag=True
)
@click.option(
    "--template-dir",
    "-td",
    help="path to a directory containing templates - overrides source folder from the config file",
    default=None,
)
def main(config, list_of_files, frame_sampling, save_frames, override, template_dir):
    logger = configure_logging_cli()
    logger.info("Loading config file")
    config = resolve_config(
        config_path=config,
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        override_templates=override,
        templates_dir=template_dir,
    )

    logger.info("Searching for Dataset Video Files")
    if list_of_files is None:
        videos = scan_videos(config.sources.root, "**", extensions=config.sources.extensions)
    else:
        videos = scan_videos_from_txt(list_of_files, extensions=config.sources.extensions)

    match_templates(files=videos, pipeline=PipelineContext(config))


if __name__ == "__main__":
    main()
