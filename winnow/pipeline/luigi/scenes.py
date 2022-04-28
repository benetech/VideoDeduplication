import os
from typing import Union

import luigi
import pandas as pd
from dataclasses import asdict

from winnow.pipeline.luigi.frame_features import FrameFeaturesTask
from winnow.pipeline.luigi.platform import PipelineTask, ConstTarget
from winnow.pipeline.luigi.targets import FileWithTimestampTarget, TaskLogRecordTarget
from winnow.pipeline.luigi.utils import ScenesDF
from winnow.utils.scene_detection import extract_scenes


class DBScenesTask(PipelineTask):
    """Save scenes to the database."""

    prefix: str = luigi.Parameter(default=".")

    # Task log attributes
    LOG_TASK_NAME = "detect-scenes"

    def output(self) -> Union[ConstTarget, TaskLogRecordTarget]:
        if not self.config.database.use:
            return ConstTarget(exists=True)
        return TaskLogRecordTarget(
            task_name=self.LOG_TASK_NAME,
            details={"prefix": self.prefix},
            database=self.pipeline.database,
            need_updates=lambda time: self.pipeline.coll.any(prefix=self.prefix, min_mtime=time),
        )

    def requires(self):
        return ScenesReportTask(config=self.config, prefix=self.prefix)

    def run(self):
        scenes_input: FileWithTimestampTarget = self.input()
        report_path = scenes_input.latest_result_path
        report_time = scenes_input.latest_result_time
        self.logger.info("Loading scenes metadata from %s", report_path)
        scenes_df = ScenesDF.read_csv(report_path)
        self.logger.info("Loaded scenes for %s files", len(scenes_df))

        self.logger.info("Saving scenes to the database")
        result_storage = self.pipeline.result_storage
        scene_entries = zip(scenes_df["path"], scenes_df["hash"], scenes_df["scene_duration_seconds"])
        result_storage.add_scenes(scene_entries)

        self.logger.info("Writing database log record")
        target = self.output()
        target.write_log(report_time)


class ScenesReportTask(PipelineTask):
    """Extract scenes and save them to csv-report."""

    prefix: str = luigi.Parameter(default=".")
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def output(self) -> FileWithTimestampTarget:
        coll = self.pipeline.coll

        return FileWithTimestampTarget(
            path_prefix=os.path.join(self.output_directory, "scenes", self.prefix, "scenes"),
            name_suffix=".csv",
            need_updates=lambda time: coll.any(prefix=self.prefix, min_mtime=time),
        )

    def requires(self):
        return FrameFeaturesTask(config=self.config, prefix=self.prefix)

    def run(self):
        target = self.output()
        latest_time = target.latest_result_time
        latest_path = target.latest_result_path
        target_time = self.pipeline.coll.max_mtime(prefix=self.prefix)
        target_path = target.suggest_path(target_time)
        file_keys = list(self.pipeline.coll.iter_keys(prefix=self.prefix, min_mtime=latest_time))

        since = latest_time or "the very beginning"
        self.logger.info("Detecting scenes for %s files from '%s' since %s", len(file_keys), self.prefix, since)
        frame_features = self.pipeline.repr_storage.frame_level
        scenes = extract_scenes(
            file_keys,
            frame_features,
            min_scene_duration=self.config.proc.minimum_scene_duration,
            progress=self.progress.bar(amount=0.8),
        )
        scenes_df = pd.DataFrame(asdict(scenes))
        self.logger.info("Detected scenes for %s files", len(scenes_df))

        if latest_path is not None:
            self.logger.info("Merging with previous results.")
            old_scenes_df = ScenesDF.read_csv(latest_path)
            scenes_df = ScenesDF.merge(old_scenes_df, scenes_df, self.progress.subtask(0.1), self.logger)
            self.logger.info("Merged with %s existing detection results", len(old_scenes_df))

        self.logger.info("Saving detected scenes to %s", target_path)

        
        scenes_df.to_csv(luigi.LocalTarget(target_path).path)

        if latest_path is not None and self.clean_existing:
            self.logger.info("Removing previous results: %s", latest_path)
            os.remove(latest_path)

        self.logger.info("Done scene detection.")


class ScenesTask(PipelineTask):
    """Detect scenes."""

    prefix: str = luigi.Parameter(default=".")

    def requires(self):
        yield ScenesReportTask(config=self.config, prefix=self.prefix)
        yield DBScenesTask(config=self.config, prefix=self.prefix)
