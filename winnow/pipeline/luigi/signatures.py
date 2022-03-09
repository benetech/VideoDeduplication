import logging
from typing import Collection, Dict, List

import luigi

from winnow.feature_extraction import SimilarityModel
from winnow.pipeline.luigi.feature_targets import FileListFeaturesTarget, FilePatternFeaturesTarget
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.video_features import VideoFeaturesListTask
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.storage.repr_utils import bulk_read, bulk_write


class SignaturesListTask(PipelineTask):
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
        return VideoFeaturesListTask(
            config_path=self.config_path,
            file_paths=target.remaining_paths,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting fingerprint extraction for %s of %s files",
            len(target.remaining_paths),
            len(target.file_paths),
        )

        extract_video_signatures(
            target.remaining_keys,
            self.pipeline,
            self.progress,
            self.logger,
        )


class SignaturesPatternTask(PipelineTask):
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
        return VideoFeaturesListTask(
            config_path=self.config_path,
            file_paths=target.remaining_paths,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting fingerprint extraction for %s of satisfying pattern %s",
            len(target.remaining_paths),
            self.path_pattern,
        )

        extract_video_signatures(
            target.remaining_keys,
            self.pipeline,
            self.progress,
            self.logger,
        )


def extract_video_signatures(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
    progress=ProgressMonitor.NULL,
    logger: logging.Logger = None,
):
    """Calculate and save signatures for the given files to repr-storage."""

    # Skip step if required results already exist
    if not file_keys:
        logger.info("Representation storage contains all required signatures. Skipping...")
        progress.complete()
        return

    # Do calculate signatures
    signatures = extract_signatures(file_keys, pipeline)
    bulk_write(pipeline.repr_storage.signature, signatures)

    logger.info("Done signature extraction.")
    progress.complete()


def extract_signatures(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
) -> Dict[FileKey, Collection[float]]:
    """Do extract signatures for the given video-files."""
    similarity_model = SimilarityModel()
    video_features = bulk_read(pipeline.repr_storage.video_level, select=file_keys)
    return similarity_model.predict(video_features)
