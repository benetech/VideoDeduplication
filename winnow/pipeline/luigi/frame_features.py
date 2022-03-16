import logging
import multiprocessing
from typing import Collection

import luigi
import numpy as np

from winnow.feature_extraction import IntermediateCnnExtractor
from winnow.pipeline.luigi.targets import PrefixFeatureTarget, PathListFileFeatureTarget, PathListFeatureTarget
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor
from winnow.storage.file_key import FileKey


class FrameFeaturesTask(PipelineTask):
    """Extract frame-level features for files with prefix."""

    prefix: str = luigi.Parameter(default=".")

    def output(self) -> PrefixFeatureTarget:
        return PrefixFeatureTarget(
            prefix=self.prefix,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.frame_level,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting frame-level feature extraction for %s file with prefix '%s'",
            len(target.remaining_keys),
            self.prefix,
        )

        extract_frame_level_features(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


class FrameFeaturesByPathListFileTask(PipelineTask):
    """Extract frame-level features for paths specified in the given text file."""

    path_list_file: str = luigi.Parameter()

    def output(self) -> PathListFileFeatureTarget:
        return PathListFileFeatureTarget(
            path_list_file=self.path_list_file,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.frame_level,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting frame-level feature extraction for %s files from the list %s",
            len(target.remaining_keys),
            self.path_list_file,
        )

        extract_frame_level_features(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


class FrameFeaturesByPathListTask(PipelineTask):
    """Extract frame-level features for files from the given list.

    Suitable for small file lists.
    """

    path_list: str = luigi.ListParameter()

    def output(self) -> PathListFeatureTarget:
        return PathListFeatureTarget(
            coll_path_list=self.path_list,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.frame_level,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting frame-level feature extraction for %s of %s files",
            len(target.remaining_keys),
            len(self.path_list),
        )

        extract_frame_level_features(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


def extract_frame_level_features(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = logging.getLogger(__name__),
):
    """Extract frame-level features from dataset videos."""

    config = pipeline.config

    # Skip step if required results already exist
    if not file_keys:
        logger.info("All required frame-level features already exist. Skipping...")
        progress.complete()
        return

    progress.scale(total_work=len(file_keys), unit="files")

    def save_features(file_key: FileKey, frames_tensor: np.ndarray, frames_features: np.ndarray):
        """Handle features extracted from a single video file."""
        pipeline.repr_storage.frame_level.write(file_key, frames_features)
        if pipeline.config.proc.save_frames:
            pipeline.repr_storage.frames.write(file_key, frames_tensor)
        progress.increase(1)

    logger.info("Initializing IntermediateCnnExtractor")
    extractor = IntermediateCnnExtractor(
        video_paths=[pipeline.coll.local_fs_path(key) for key in file_keys],
        video_ids=file_keys,
        on_extracted=save_features,
        frame_sampling=config.proc.frame_sampling,
        model=pipeline.pretrained_model,
    )

    logger.info("Extracting frame-level features.")
    extractor.extract_features(batch_size=16, cores=multiprocessing.cpu_count())
    logger.info("Done frame-level feature extraction.")
    progress.complete()
