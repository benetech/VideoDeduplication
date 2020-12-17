import click

from winnow.pipeline.generate_matches import generate_matches
from winnow.utils.config import resolve_config
from winnow.utils.logging import configure_logging_cli


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=None)
def main(config):
    logger = configure_logging_cli()
    logger.info("Loading config file")
    config = resolve_config(config_path=config)

    generate_matches(config)


if __name__ == "__main__":
    main()
