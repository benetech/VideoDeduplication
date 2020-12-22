import click

from winnow.pipeline.generate_matches import generate_matches
from winnow.utils.files import scan_videos_from_txt
from winnow.utils.config import resolve_config
from winnow.utils.logging import configure_logging_cli


@click.command()
@click.option("--config", "-cp", help="path to the project config file", default=None)
@click.option(
    "--list-of-files",
    "-lof",
    help="path to txt with a list of files for processing - overrides source folder from the config file",
    default=None,
)
def main(config, list_of_files):
    logger = configure_logging_cli()
    logger.info("Loading config file")
    config = resolve_config(config_path=config)
    files = []
    print(list_of_files)
    if list_of_files:
        files = scan_videos_from_txt(list_of_files, extensions=config.sources.extensions)
        print(files, "after scan")

    generate_matches(config, files=files)


if __name__ == "__main__":
    main()
