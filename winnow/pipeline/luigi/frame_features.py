import logging
import multiprocessing
from typing import Collection, List

import luigi

from winnow.feature_extraction import IntermediateCnnExtractor
from winnow.pipeline.luigi.feature_targets import FileListFeaturesTarget, FilePatternFeaturesTarget
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor


class FrameFeaturesListTask(PipelineTask):
    """Extract frame-level features for the listed files."""

    file_paths: List[str] = luigi.ListParameter()

    # This task has maximal relative time complexity
    progress_weight = 20.0

    def output(self):
        return FileListFeaturesTarget(
            file_paths=self.file_paths,
            reprs=self.pipeline.repr_storage.frames,
            resolve_key=self.pipeline.filekey,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting frame-level feature extraction for %s of %s files",
            len(target.remaining_paths),
            len(target.file_paths),
        )

        extract_frame_level_features(
            self.output().remaining_paths,
            self.pipeline,
            self.progress,
            self.logger,
        )


class FrameFeaturesPatternTask(PipelineTask):
    """Extract frame-level features for the files satisfying the glob pattern."""

    path_pattern: str = luigi.Parameter()

    # This task has maximal relative time complexity
    progress_weight = 20.0

    def output(self):
        return FilePatternFeaturesTarget(
            path_pattern=self.path_pattern,
            reprs=self.pipeline.repr_storage.frames,
            resolve_key=self.pipeline.filekey,
            query_paths=self.pipeline.query_paths,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting frame-level feature extraction for %s of satisfying pattern %s",
            len(target.remaining_paths),
            self.path_pattern,
        )

        extract_frame_level_features(
            self.output().remaining_paths,
            self.pipeline,
            self.progress,
            self.logger,
        )


def extract_frame_level_features(
    file_paths: Collection[str],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = None,
):
    """Extract frame-level features from dataset videos."""

    config = pipeline.config
    logger = logger or logging.getLogger(__name__)

    # Skip step if required results already exist
    if not file_paths:
        logger.info("All required frame-level features already exist. Skipping...")
        progress.complete()
        return

    progress.scale(total_work=len(file_paths), unit="file")

    def save_features(file_path, frames_tensor, frames_features):
        """Handle features extracted from a single video file."""
        key = pipeline.filekey(file_path)
        pipeline.repr_storage.frame_level.write(key, frames_features)
        if pipeline.config.proc.save_frames:
            pipeline.repr_storage.frames.write(key, frames_tensor)
        progress.increase(1)

    extractor = IntermediateCnnExtractor(
        videos=file_paths,
        on_extracted=save_features,
        frame_sampling=config.proc.frame_sampling,
        model=pipeline.pretrained_model,
    )

    # Do extract frame-level features
    extractor.extract_features(batch_size=16, cores=multiprocessing.cpu_count())
    logger.info("Done frame-level feature extraction.")
    progress.complete()
