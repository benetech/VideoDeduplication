import click

from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.prepare_text_search import prepare_text_search
from winnow.utils.config import resolve_config
from winnow.utils.logging import configure_logging_cli


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=None)
@click.option("--force", "-f", help="Rebuild existing text search index", default=False, is_flag=True)
def main(config, force):
    logger = configure_logging_cli()
    logger.info("Loading config file")
    config = resolve_config(config_path=config)

    pipeline = PipelineContext(config)
    prepare_text_search(pipeline, force)


if __name__ == "__main__":
    main()
