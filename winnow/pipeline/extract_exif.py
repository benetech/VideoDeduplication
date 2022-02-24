import logging
from os.path import join
from typing import Iterable

from db.schema import Files
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.repr_utils import path_resolver
from winnow.utils.files import scan_videos, get_hash
from winnow.utils.metadata_extraction import extract_from_list_of_videos, convert_to_df, parse_and_filter_metadata_df


def extract_exif(videos: Iterable[str], pipeline: PipelineContext, progress_monitor=ProgressMonitor.NULL):
    """Extract EXIF metadata from video files."""

    logger = logging.getLogger(__name__)
    config = pipeline.config
    storepath = path_resolver(config.sources.root)

    if videos is not None:
        hashes = [get_hash(video, config.repr.hash_mode) for video in videos]
    elif config.database.use:
        with pipeline.database.session_scope() as session:
            video_records = session.query(Files).filter(Files.contributor == None).yield_per(10 ** 4)  # noqa: E711
            path_hash_pairs = [(join(config.sources.root, record.file_path), record.sha256) for record in video_records]
            videos, hashes = zip(*path_hash_pairs)
    else:
        videos = scan_videos(config.sources.root, "**", extensions=config.sources.extensions)
        hashes = [get_hash(video, config.repr.hash_mode) for video in videos]

    assert len(videos) > 0, "No videos found"

    logger.info(f"{len(videos)} videos found")

    metadata = extract_from_list_of_videos(videos)

    df = convert_to_df(metadata)

    df_parsed = parse_and_filter_metadata_df(df, metadata)

    assert len(metadata) == len(df_parsed)

    if config.save_files:

        EXIF_REPORT_PATH = join(config.repr.directory, "exif_metadata.csv")

        df_parsed.to_csv(EXIF_REPORT_PATH)

        logger.info(f"Exif Metadata report exported to:{EXIF_REPORT_PATH}")

    if config.database.use:
        result_store = DBResultStorage(pipeline.database)
        exif_entries = zip(map(storepath, videos), hashes, df_parsed.to_dict("records"))
        result_store.add_exifs(exif_entries)

    progress_monitor.complete()
