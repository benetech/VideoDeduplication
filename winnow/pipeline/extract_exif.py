import logging
from os.path import join

from db import Database
from db.schema import Files
from winnow.config import Config
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.db_result_storage import DBResultStorage
from winnow.storage.repr_utils import path_resolver
from winnow.utils.files import scan_videos, get_hash
from winnow.utils.metadata_extraction import extract_from_list_of_videos, convert_to_df, parse_and_filter_metadata_df


def extract_exif(config: Config, progress_monitor=ProgressMonitor.NULL):
    """Extract EXIF metadata from video files."""

    logger = logging.getLogger(__name__)
    storepath = path_resolver(config.sources.root)

    if config.database.use:
        database = Database(uri=config.database.uri)
        database.create_tables()

        with database.session_scope() as session:
            video_records = session.query(Files).yield_per(10 ** 4)
            path_hash_pairs = [(join(config.sources.root, record.file_path), record.sha256) for record in video_records]
            videos, hashes = zip(*path_hash_pairs)
    else:

        videos = scan_videos(config.sources.root, "**", extensions=config.sources.extensions)
        hashes = [get_hash(video) for video in videos]

    assert len(videos) > 0, "No videos found"

    logger.info(f"{len(videos)} videos found")

    metadata = extract_from_list_of_videos(videos)

    df = convert_to_df(metadata)

    df_parsed = parse_and_filter_metadata_df(df)

    assert len(metadata) == len(df_parsed)

    if config.save_files:

        EXIF_REPORT_PATH = join(config.repr.directory, "exif_metadata.csv")

        df_parsed.to_csv(EXIF_REPORT_PATH)

        logger.info(f"Exif Metadata report exported to:{EXIF_REPORT_PATH}")

    if config.database.use:
        database = Database(uri=config.database.uri)
        result_store = DBResultStorage(database)
        exif_entries = zip(map(storepath, videos), hashes, df_parsed.to_dict("records"))
        result_store.add_exifs(exif_entries)

    progress_monitor.complete()
