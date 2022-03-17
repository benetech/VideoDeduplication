import logging
import os
from datetime import datetime
from typing import Iterable, Iterator, Any, Tuple

import luigi
import pandas as pd

from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.targets import PrefixTarget
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.utils.metadata_extraction import extract_from_list_of_videos, convert_to_df, parse_and_filter_metadata_df


class ExifTask(PipelineTask):
    """Extract EXIF data and save it to the CSV."""

    prefix: str = luigi.Parameter(default=".")

    def output(self):
        coll = self.pipeline.coll

        return PrefixTarget(
            target_folder=os.path.join(self.config.repr.directory, "exif"),
            target_name="exif_metadata",
            target_ext=".csv",
            prefix=self.prefix,
            need_updates=lambda time: coll.any(prefix=self.prefix, min_mtime=time),
        )

    def run(self):
        target = self.output()
        latest_time = target.latest_result_time
        self.logger.info(
            "Extracting EXIF metadata from files with prefix '%s' created after %s",
            self.prefix,
            latest_time,
        )

        latest_path = target.latest_result_path
        target_time = datetime.now()
        target_path = target.path(target_time)
        file_keys = list(self.pipeline.coll.iter_keys(prefix=self.prefix, min_mtime=latest_time))
        exif_df = extract_exif(
            file_keys=file_keys,
            pipeline=self.pipeline,
            progress=self.progress.subtask(0.9),
            logger=self.logger,
        )

        self.logger.info("Saving EXIF metadata to %s", target_path)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        exif_df.to_csv(target_path)
        self.progress.increase(0.05)

        if latest_path is not None:
            self.logger.info("Removing previous EXIF file %s", latest_path)
            os.remove(latest_path)

        if self.config.database.use:
            self.logger.info("Saving EXIF to database")
            save_exif_database(file_keys=file_keys, exif_df=exif_df, pipeline=self.pipeline)
        self.progress.complete()


def extract_exif(
    file_keys: Iterable[FileKey],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = logging.getLogger(__name__),
) -> pd.DataFrame:
    """Extract EXIF metadata from video files."""
    progress.scale(1.0)
    coll = pipeline.coll
    paths = [coll.local_fs_path(key, raise_exception=False) for key in file_keys]
    logger.info("Starting EXIF extraction for %s files", len(paths))
    metadata = extract_from_list_of_videos(paths, progress.subtask(0.8))
    logger.info("Extracted EXIF for %s files", len(paths))

    logger.info("Converting EXIF to DataFrame")
    exif_df = convert_to_df(metadata)
    exif_df = parse_and_filter_metadata_df(exif_df, metadata)
    logger.info("Done converting EXIF to DataFrame")
    progress.complete()
    return exif_df


def save_exif_database(file_keys: Iterable[FileKey], exif_df: pd.DataFrame, pipeline: PipelineContext):
    """Save EXIF metadata to database."""
    result_store = pipeline.result_storage

    def entries() -> Iterator[Tuple[str, str, Any]]:
        """Database entries."""
        for file_key, record in zip(file_keys, exif_df.to_dict("records")):
            yield file_key.path, file_key.hash, record

    result_store.add_exifs(entries())
