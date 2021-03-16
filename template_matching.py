import os
import click
from db import Database
from winnow.config import Config
from winnow.config.path import resolve_config_path
from winnow.feature_extraction import default_model_path
from winnow.feature_extraction.extraction_routine import load_featurizer
from winnow.search_engine.template_matching import SearchEngine
from winnow.storage.repr_storage import ReprStorage
from winnow.storage.db_result_storage import DBResultStorage

config = Config.read(resolve_config_path())


TEMPLATE_TEST_OUTPUT = os.path.join(config.repr.directory, "template_test.csv")
DISTANCE = 0.07
DISTANCE_MIN = 0.05


@click.command()
@click.option(
    "--override", "-ovr", help="Overrides the previous template matches saved on the DB", default=False, is_flag=True
)
@click.option(
    "--template-dir",
    "-td",
    help="path to a directory containing templates - overrides source folder from the config file",
    default="",
)
def main(override, template_dir):

    print("Loading model...")
    model_path = default_model_path(config.proc.pretrained_model_local_path)
    model = load_featurizer(model_path)

    templates_source = config.templates.source_path

    if len(template_dir) > 0:

        templates_source = template_dir

    print(
        f"Initiating search engine using templates from: "
        f"{templates_source} and looking at "
        f"videos located in: {config.repr.directory}"
    )

    reprs = ReprStorage(config.repr.directory)
    se = SearchEngine(templates_root=templates_source, reprs=reprs, model=model)

    template_matches = se.create_annotation_report(
        threshold=DISTANCE,
        fp=TEMPLATE_TEST_OUTPUT,
        frame_sampling=config.proc.frame_sampling,
        distance_min=DISTANCE_MIN,
    )

    tm_entries = template_matches[["path", "hash"]]
    tm_entries["template_matches"] = template_matches.drop(columns=["path", "hash"]).to_dict("records")

    if config.database.use:

        # Connect to database
        database = Database(uri=config.database.uri)
        database.create_tables()

        # Save Template Matches
        result_storage = DBResultStorage(database)
        result_storage.add_template_matches(tm_entries.to_numpy(), override=override)

    if config.save_files:

        TEMPLATE_MATCHES_REPORT_PATH = os.path.join(config.repr.directory, "template_matches.csv")
        template_matches.to_csv(TEMPLATE_MATCHES_REPORT_PATH)

        print(f"Template Matches report exported to:{TEMPLATE_MATCHES_REPORT_PATH}")

    print("Report saved to {}".format(TEMPLATE_TEST_OUTPUT))


if __name__ == "__main__":

    main()
