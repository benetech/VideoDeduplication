import click

from winnow.pipeline.extract_exif import extract_exif
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.utils.config import resolve_config
from winnow.utils.logging import configure_logging_cli


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=None)
def main(config):
    config = resolve_config(config_path=config)
    logger = configure_logging_cli(config.logging)
    logger.info("Loaded config file")

    extract_exif(videos=None, pipeline=PipelineContext(config))


if __name__ == "__main__":
    main()
