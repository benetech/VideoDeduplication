import logging
from typing import Collection

from winnow.pipeline.extract_frame_level_features import frame_features_exist, extract_frame_level_features
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.search_engine import SearchEngine, Template
from winnow.search_engine.black_list import BlackList
from winnow.search_engine.model import Frame
from winnow.utils.files import get_hash
from winnow.config import Config

# Default module logger
logger = logging.getLogger(__name__)


def find_frame(frame: Frame, files: Collection[str], pipeline: PipelineContext, progress=ProgressMonitor.NULL):
    """Find frame among other videos."""

    config = pipeline.config

    # We don't check for pre-existing templates so far...
    # So we always perform search for all videos.
    remaining_files = tuple(files)

    # Ensure dependencies are satisfied
    if not frame_features_exist(remaining_files, pipeline):
        extract_frame_level_features(remaining_files, pipeline, progress=progress.subtask(0.8))
        progress = progress.subtask(0.2)

    template = pipeline.template_loader.load_template_from_frame(frame)
    logger.info("Loaded temporary template: %s", template.name)

    black_list = make_black_list(template, frame, config)
    logger.info("Frame source file is excluded from the search scope.")

    se = SearchEngine(frame_features=pipeline.repr_storage.frame_level, black_list=black_list)
    template_matches = se.create_annotation_report(
        templates=[template],
        threshold=config.templates.distance,
        frame_sampling=config.proc.frame_sampling,
        distance_min=config.templates.distance_min,
    )

    tm_entries = template_matches[["path", "hash"]]
    tm_entries["template_matches"] = template_matches.drop(columns=["path", "hash"]).to_dict("records")

    logger.info("Found %s frame matches", len(tm_entries))
    progress.complete()

    return tm_entries


def make_black_list(template: Template, frame: Frame, config: Config) -> BlackList:
    """Exclude the frame source from the template scope."""
    black_list = BlackList()
    black_list.exclude_file(
        template_name=template.name, file_path=frame.path, file_hash=get_hash(frame.path, config.repr.hash_mode)
    )
    return black_list
