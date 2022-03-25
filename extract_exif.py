import logging.config

import click
import luigi

from winnow.pipeline.luigi.exif import ExifTask
from winnow.utils.config import resolve_config


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=None)
def main(config):
    config = resolve_config(config_path=config)
    logging.config.fileConfig("./logging.conf")
    luigi.build([ExifTask(config=config)], local_scheduler=True, workers=1)


if __name__ == "__main__":
    main()
