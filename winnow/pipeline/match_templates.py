import logging
import os
from typing import Collection

from winnow.pipeline.extract_frame_level_features import frame_features_exist, extract_frame_level_features
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.search_engine.template_matching import SearchEngine

# Default module logger
logger = logging.getLogger(__name__)


def match_templates(files: Collection[str], pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Match existing templates with dataset videos."""

    config = pipeline.config

    # We don't check for pre-existing templates so far...
    # So we always perform search for all videos.
    remaining_files = tuple(files)

    # Ensure dependencies are satisfied
    if not frame_features_exist(remaining_files, pipeline):
        extract_frame_level_features(remaining_files, pipeline, progress=progress.subtask(0.7))
        progress = progress.subtask(0.3)

    templates_source = config.templates.source_path

    logger.info(
        f"Initiating search engine using templates from: "
        f"{templates_source} and looking at "
        f"videos located in: {config.repr.directory}"
    )

    templates = pipeline.template_loader.load_templates_from_folder(templates_source)

    se = SearchEngine(reprs=pipeline.repr_storage)
    template_matches = se.create_annotation_report(
        templates=templates,
        threshold=config.templates.distance,
        frame_sampling=config.proc.frame_sampling,
        distance_min=config.templates.distance_min,
    )

    tm_entries = template_matches[["path", "hash"]]
    tm_entries["template_matches"] = template_matches.drop(columns=["path", "hash"]).to_dict("records")

    if config.database.use:
        # Save Template Matches
        result_storage = pipeline.result_storage
        template_names = {template.name for template in templates}
        result_storage.add_template_matches(template_names, tm_entries.to_numpy())

    if config.save_files:
        template_matches_report_path = os.path.join(config.repr.directory, "template_matches.csv")
        template_matches.to_csv(template_matches_report_path)

        logger.info("Template Matches report exported to: %s", template_matches_report_path)

    template_test_output = os.path.join(pipeline.config.repr.directory, "template_test.csv")
    logger.info("Report saved to %s", template_test_output)
    progress.complete()
