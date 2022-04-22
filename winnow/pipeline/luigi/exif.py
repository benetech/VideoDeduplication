import logging
import os
from typing import Iterable, Iterator, Any, Tuple, Union

import luigi
import pandas as pd
from cached_property import cached_property

from winnow.pipeline.luigi.platform import PipelineTask, ConstTarget
from winnow.pipeline.luigi.targets import FileWithTimestampTarget, TaskLogRecordTarget
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.utils.files import hash_file
from winnow.utils.metadata_extraction import extract_from_list_of_videos, convert_to_df, parse_and_filter_metadata_df


class DBExifTask(PipelineTask):
    """Extract EXIF data and save it to the database."""

    prefix: str = luigi.Parameter(default=".")

    # Database TaskLogRecord attributes
    LOG_TASK_NAME = "extract-exif"

    def output(self) -> Union[ConstTarget, TaskLogRecordTarget]:
        if not self.config.database.use:
            return ConstTarget(exists=True)
        return TaskLogRecordTarget(
            task_name=self.LOG_TASK_NAME,
            details={"prefix": self.prefix},
            database=self.pipeline.database,
            need_updates=lambda time: self.pipeline.coll.any(prefix=self.prefix, min_mtime=time),
        )

    def run(self):
        target = self.output()
        latest_time = target.last_time
        self.logger.info(
            "Extracting EXIF metadata from files with prefix '%s' created after %s",
            self.prefix,
            latest_time,
        )

        target_time = self.pipeline.coll.max_mtime(prefix=self.prefix)
        file_keys = list(self.pipeline.coll.iter_keys(prefix=self.prefix, min_mtime=latest_time))
        self.logger.info("Extracting exif for %s files", len(file_keys))
        exif_df = extract_exif(
            file_keys=file_keys,
            pipeline=self.pipeline,
            progress=self.progress.subtask(0.9),
            logger=self.logger,
        )

        self.logger.info("Saving EXIF to database")
        save_exif_database(file_keys=file_keys, exif_df=exif_df, pipeline=self.pipeline)
        target.write_log(target_time)
        self.progress.complete()


class ExifReportTask(PipelineTask):
    """Extract EXIF data and save it to the CSV."""

    prefix: str = luigi.Parameter(default=".")

    def output(self):
        coll = self.pipeline.coll

        return FileWithTimestampTarget(
            path_prefix=os.path.join(self.output_directory, "exif", self.prefix, "exif"),
            name_suffix=".csv",
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
        target_time = self.pipeline.coll.max_mtime(prefix=self.prefix)
        target_path = target.suggest_path(target_time)
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


class ExifReportFileListFileTask(PipelineTask):
    """Extract EXIF data and save it to the CSV."""

    path_list_file: str = luigi.Parameter()
    output_path: str = luigi.Parameter(default=None)

    def output(self):
        return luigi.LocalTarget(self.result_path)

    def run(self):
        self.logger.info("Reading paths list from %s", self.path_list_file)
        with open(self.path_list_file, "r") as list_file:
            paths = list(map(str.strip, list_file.readlines()))
        self.logger.info("%s paths was selected", len(paths))

        file_keys = list(map(self.pipeline.coll.file_key, paths))
        exif_df = extract_exif(
            file_keys=file_keys,
            pipeline=self.pipeline,
            progress=self.progress.subtask(0.9),
            logger=self.logger,
        )

        self.logger.info("Saving EXIF metadata to %s", self.result_path)
        os.makedirs(os.path.dirname(self.result_path), exist_ok=True)
        with self.output().open("w") as output:
            exif_df.to_csv(output)
        self.progress.increase(0.05)

    @cached_property
    def result_path(self) -> str:
        """Resolved result report path."""
        if self.output_path is not None:
            return self.output_path
        list_hash = hash_file(self.path_list_file)[10:]
        return os.path.join(self.output_directory, "exif", f"exif_list_{list_hash}.csv")


class ExifTask(PipelineTask):
    """Extract exif task."""

    prefix: str = luigi.Parameter(default=".")

    def requires(self):
        yield ExifReportTask(config=self.config, prefix=self.prefix)
        yield DBExifTask(config=self.config, prefix=self.prefix)


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
