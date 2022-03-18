import logging.config
import os

import click
import luigi

from winnow.config.path import resolve_config_path, ensure_config_exists
from winnow.pipeline.luigi.exif import ExifTask
from winnow.pipeline.luigi.matches import DBMatchesTask


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
def main(config):
    config_path = resolve_config_path(config)
    ensure_config_exists(config_path)
    logging.config.fileConfig("./logging.conf")
    luigi.build(
        [
            DBMatchesTask(config_path=config_path),
            ExifTask(config_path=config_path),
        ],
        local_scheduler=True,
        workers=1,
    )


if __name__ == "__main__":
    main()
