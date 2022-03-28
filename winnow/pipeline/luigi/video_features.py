import logging
from typing import Collection

import luigi

from winnow.feature_extraction.loading_utils import global_vector
from winnow.pipeline.luigi.targets import PathListFeatureTarget, PathListFileFeatureTarget, PrefixFeatureTarget
from winnow.pipeline.luigi.frame_features import (
    FrameFeaturesByPathListTask,
    FrameFeaturesByPathListFileTask,
    FrameFeaturesTask,
)
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor
from winnow.storage.file_key import FileKey


class VideoFeaturesTask(PipelineTask):
    """Extract video-level features for files with prefix."""

    prefix: str = luigi.Parameter(default=".")

    def requires(self):
        return FrameFeaturesTask(
            config=self.config,
            prefix=self.prefix,
        )

    def output(self) -> PrefixFeatureTarget:
        return PrefixFeatureTarget(
            prefix=self.prefix,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.video_level,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting video-level feature extraction for %s file with prefix '%s'",
            len(target.remaining_keys),
            self.prefix,
        )

        extract_video_level_features(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


class VideoFeaturesByPathListFileTask(PipelineTask):
    """Extract video-level features for paths specified in the given text file."""

    path_list_file: str = luigi.Parameter()

    def requires(self):
        return FrameFeaturesByPathListFileTask(
            config=self.config,
            path_list_file=self.path_list_file,
        )

    def output(self) -> PathListFileFeatureTarget:
        return PathListFileFeatureTarget(
            path_list_file=self.path_list_file,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.video_level,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting video-level feature extraction for %s files from the list %s",
            len(target.remaining_keys),
            self.path_list_file,
        )

        extract_video_level_features(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


class VideoFeaturesByPathListTask(PipelineTask):
    """Extract video-level features for files from the given list.

    Suitable for small file lists.
    """

    path_list: str = luigi.ListParameter()

    def requires(self):
        return FrameFeaturesByPathListTask(
            config=self.config,
            path_list=self.path_list,
        )

    def output(self) -> PathListFeatureTarget:
        return PathListFeatureTarget(
            coll_path_list=self.path_list,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.video_level,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting video-level feature extraction for %s of %s files",
            len(target.remaining_keys),
            len(self.path_list),
        )

        extract_video_level_features(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


def extract_video_level_features(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = logging.getLogger(__name__),
):
    """Extract video-level features from the dataset videos."""

    # Skip step if required results already exist
    if not file_keys:
        logger.info("All required video-level features already exist. Skipping...")
        progress.complete()
        return

    # Convert frame features to global features
    progress.scale(len(file_keys))
    for key in file_keys:
        try:
            frame_features = pipeline.repr_storage.frame_level.read(key)
            video_representation = global_vector(frame_features)
            pipeline.repr_storage.video_level.write(key, video_representation)
        except Exception:
            logger.exception("Error computing video-level features for file: %s", key)
        finally:
            progress.increase(1)
    logger.info("Done video-level feature extraction.")
    progress.complete()
