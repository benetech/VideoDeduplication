import logging
from functools import lru_cache as cached
from typing import Collection

import luigi

from winnow.feature_extraction import SimilarityModel
from winnow.pipeline.luigi.feature_targets import (
    PrefixFeatureTarget,
    PathListFeatureTarget,
    PathListFileFeatureTarget,
)
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.video_features import (
    VideoFeaturesByPrefixTask,
    VideoFeaturesByPathListFileTask,
    VideoFeaturesByPathListTask,
)
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.storage.repr_utils import bulk_read, bulk_write


class SignaturesByPrefixTask(PipelineTask):
    """Extract fingerprints for files with prefix."""

    prefix: str = luigi.Parameter(default=".")

    def requires(self):
        return VideoFeaturesByPrefixTask(
            config_path=self.config_path,
            prefix=self.prefix,
        )

    @cached()
    def output(self) -> PrefixFeatureTarget:
        return PrefixFeatureTarget(
            prefix=self.prefix,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.signature,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting fingerprint extraction for %s file with prefix %s",
            len(target.remaining_keys),
            self.prefix,
        )

        extract_video_signatures(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


class SignaturesByPathListFileTask(PipelineTask):
    """Extract fingerprints for paths specified in the given text file."""

    path_list_file: str = luigi.Parameter()

    def requires(self):
        return VideoFeaturesByPathListFileTask(
            config_path=self.config_path,
            path_list_file=self.path_list_file,
        )

    @cached()
    def output(self) -> PathListFileFeatureTarget:
        return PathListFileFeatureTarget(
            path_list_file=self.path_list_file,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.signature,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting fingerprint extraction for %s files from the list %s",
            len(target.remaining_keys),
            self.path_list_file,
        )

        extract_video_signatures(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


class SignaturesByPathListTask(PipelineTask):
    """Extract fingerprints for files from the given list.

    Suitable for small file lists.
    """

    path_list: str = luigi.ListParameter()

    def requires(self):
        return VideoFeaturesByPathListTask(
            config_path=self.config_path,
            path_list=self.path_list,
        )

    @cached()
    def output(self) -> PathListFeatureTarget:
        return PathListFeatureTarget(
            coll_path_list=self.path_list,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.signature,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting fingerprint extraction for %s of %s files",
            len(target.remaining_keys),
            len(self.path_list),
        )

        extract_video_signatures(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


def extract_video_signatures(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = logging.getLogger(__name__),
):
    """Calculate and save signatures for the given files to repr-storage."""

    # Skip step if required results already exist
    if not file_keys:
        logger.info("Representation storage contains all required signatures. Skipping...")
        progress.complete()
        return

    # Do calculate signatures
    logger.info("Reading similarity model.")
    similarity_model = SimilarityModel()

    logger.info("Reading video-level features.")
    video_features = bulk_read(pipeline.repr_storage.video_level, select=file_keys)
    logger.info("Loaded %s vide-level features", len(video_features))

    logger.info("Calculating fingerprints from video-level features.")
    signatures = similarity_model.predict(video_features)

    logger.info("Saving fingerprints.")
    bulk_write(pipeline.repr_storage.signature, signatures)

    logger.info("Done signature extraction.")
    progress.complete()
