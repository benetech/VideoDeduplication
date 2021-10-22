import logging
import os
from typing import Collection, List

from sqlalchemy.orm import joinedload

from db.schema import TemplateFileExclusion, TemplateMatches
from winnow.pipeline.extract_frame_level_features import frame_features_exist, extract_frame_level_features
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.search_engine import Template
from winnow.search_engine.black_list import BlackList
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

    # Load templates
    templates = load_templates(pipeline)
    logger.info("Loaded %s templates", len(templates))
    if len(templates) == 0:
        logger.info("No templates found. Skipping template matching step...")
        progress.complete()
        return

    # Load file exclusions
    black_list = load_black_list(pipeline)
    logger.info(
        "Found %s file exclusions and %s time exclusions",
        black_list.file_exclusions_count,
        black_list.time_exclusions_count,
    )

    se = SearchEngine(frame_features=pipeline.repr_storage.frame_level, black_list=black_list)
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


def load_templates(pipeline: PipelineContext) -> List[Template]:
    """Load templates according to the pipeline config."""
    config = pipeline.config
    templates_source = config.templates.source_path
    if templates_source:
        logger.info("Loading templates from: %s", templates_source)
        templates = pipeline.template_loader.load_templates_from_folder(templates_source)
        if config.database.use:
            return pipeline.template_loader.store_templates(templates, pipeline.database, pipeline.file_storage)
        return templates
    elif config.database.use:
        logger.info("Loading templates from the database")
        return pipeline.template_loader.load_templates_from_database(pipeline.database, pipeline.file_storage)
    else:
        logger.error("Neither database nor template source directory are not available")
        return []


def load_black_list(pipeline: PipelineContext) -> BlackList:
    """Get template file exclusions."""

    # Load file exclusions
    config = pipeline.config
    file_exclusions = ()
    time_exclusions = ()
    if config.database.use:
        with pipeline.database.session_scope(expunge=True) as session:
            file_exclusions = (
                session.query(TemplateFileExclusion)
                .options(joinedload(TemplateFileExclusion.file))
                .options(joinedload(TemplateFileExclusion.template))
                .all()
            )
            time_exclusions = (
                session.query(TemplateMatches)
                .options(joinedload(TemplateMatches.file))
                .options(joinedload(TemplateMatches.template))
                .filter(TemplateMatches.false_positive == True)  # noqa: E712
                .all()
            )

    # Populate black list
    black_list = BlackList()
    for file_exclusion in file_exclusions:
        black_list.exclude_file_entity(file_exclusion)
    for time_exclusion in time_exclusions:
        black_list.exclude_time_range(time_exclusion)
    return black_list
