import logging
from typing import Collection, List

import luigi

from winnow.feature_extraction.loading_utils import global_vector
from winnow.pipeline.luigi.feature_targets import FilePatternFeaturesTarget, FileListFeaturesTarget
from winnow.pipeline.luigi.frame_features import FrameFeaturesListTask
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor
from winnow.storage.file_key import FileKey


class VideoFeaturesListTask(PipelineTask):
    """Extract frame-level features for the listed files."""

    file_paths: List[str] = luigi.ListParameter()

    def output(self):
        return FileListFeaturesTarget(
            file_paths=self.file_paths,
            reprs=self.pipeline.repr_storage.video_level,
            resolve_key=self.pipeline.filekey,
        )

    def requires(self):
        target = self.output()
        return FrameFeaturesListTask(
            config_path=self.config_path,
            file_paths=target.remaining_paths,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting video-level feature extraction for %s of %s files",
            len(target.remaining_paths),
            len(target.file_paths),
        )

        extract_video_level_features(
            target.remaining_keys,
            self.pipeline,
            self.progress,
            self.logger,
        )


class VideoFeaturesPatternTask(PipelineTask):
    """Extract frame-level features for the files satisfying the glob pattern."""

    path_pattern: str = luigi.Parameter()

    def output(self):
        return FilePatternFeaturesTarget(
            path_pattern=self.path_pattern,
            reprs=self.pipeline.repr_storage.video_level,
            resolve_key=self.pipeline.filekey,
            query_paths=self.pipeline.query_paths,
        )

    def requires(self):
        target = self.output()
        return FrameFeaturesListTask(
            config_path=self.config_path,
            file_paths=target.remaining_paths,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting video-level feature extraction for %s of satisfying pattern %s",
            len(target.remaining_paths),
            self.path_pattern,
        )

        extract_video_level_features(
            target.remaining_keys,
            self.pipeline,
            self.progress,
            self.logger,
        )


def extract_video_level_features(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = None,
):
    """Extract video-level features from the dataset videos."""
    logger = logger or logging.getLogger(__name__)

    # Skip step if required results already exist
    if not file_keys:
        logger.info("All required video-level features already exist. Skipping...")
        progress.complete()
        return

    frame_to_global(file_keys, pipeline, progress.remaining())
    logger.info("Done video-level feature extraction.")
    progress.complete()


def frame_to_global(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = None,
):
    """Calculate and save video-level feature vectors based on frame-level representation."""
    logger = logger or logging.getLogger(__name__)
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
    progress.complete()
