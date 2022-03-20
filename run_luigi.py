import logging.config
import os

import click
import luigi

from winnow.pipeline.luigi.exif import ExifTask
from winnow.pipeline.luigi.matches import DBMatchesTask
from winnow.utils.config import resolve_config


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
def main(config):
    config = resolve_config(config_path=config)
    logging.config.fileConfig("./logging.conf")
    luigi.build(
        [
            DBMatchesTask(config=config),
            ExifTask(config=config),
        ],
        local_scheduler=True,
        workers=1,
    )


if __name__ == "__main__":
    main()
