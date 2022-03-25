import logging.config
import os

import click
import luigi

from winnow.pipeline.luigi.templates import TemplateMatchesReportTask
from winnow.utils.config import resolve_config


@click.command()
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
@click.option(
    "--override", "-ovr", help="Overrides the previous template matches saved on the DB", default=None, is_flag=True
)
@click.option(
    "--template-dir",
    "-td",
    help="path to a directory containing templates - overrides source folder from the config file",
    default=None,
)
def main(config, frame_sampling, save_frames, override, template_dir):
    logging.config.fileConfig("./logging.conf")
    config = resolve_config(
        config_path=config,
        frame_sampling=frame_sampling,
        save_frames=save_frames,
        override_templates=override,
        templates_dir=template_dir,
    )

    luigi.build([TemplateMatchesReportTask(config=config)], local_scheduler=True, workers=1)


if __name__ == "__main__":
    main()
