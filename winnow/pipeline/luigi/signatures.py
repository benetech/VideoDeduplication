import logging
from pickle import dumps
from typing import Collection, Iterator

import luigi
from cached_property import cached_property
from dataclasses import astuple

from db import Database
from db.access.files import FilesDAO
from winnow.feature_extraction import SimilarityModel
from winnow.pipeline.luigi.platform import PipelineTask, ConstTarget
from winnow.pipeline.luigi.targets import (
    PrefixFeatureTarget,
    PathListFeatureTarget,
    PathListFileFeatureTarget,
)
from winnow.pipeline.luigi.utils import KeyIter
from winnow.pipeline.luigi.video_features import (
    VideoFeaturesTask,
    VideoFeaturesByPathListFileTask,
    VideoFeaturesByPathListTask,
)
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.storage.repr_utils import bulk_read, bulk_write


class SignaturesTask(PipelineTask):
    """Extract fingerprints for files with prefix."""

    prefix: str = luigi.Parameter(default=".")

    def requires(self):
        return VideoFeaturesTask(
            config=self.config,
            prefix=self.prefix,
        )

    def output(self) -> PrefixFeatureTarget:
        return PrefixFeatureTarget(
            prefix=self.prefix,
            coll=self.pipeline.coll,
            reprs=self.pipeline.repr_storage.signature,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Starting fingerprint extraction for %s file with prefix '%s'",
            len(target.remaining_keys),
            self.prefix,
        )

        extract_signatures(
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
            config=self.config,
            path_list_file=self.path_list_file,
        )

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

        extract_signatures(
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
            config=self.config,
            path_list=self.path_list,
        )

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

        extract_signatures(
            file_keys=target.remaining_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


def extract_signatures(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = logging.getLogger(__name__),
):
    """Calculate and save signatures for the given files to repr-storage
    assuming the corresponding video-level features are already available.
    """

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


class DBSignaturesTarget(luigi.Target):
    def __init__(self, keys: Iterator[FileKey], database: Database):
        self.keys: Iterator[FileKey] = keys
        self.database: Database = database

    def exists(self):
        return not self.missing_keys

    @cached_property
    def missing_keys(self) -> Collection[FileKey]:
        """Calculate remaining keys."""
        with self.database.session_scope() as session:
            path_hash_pairs = map(astuple, self.keys)
            missing_signatures = FilesDAO.select_missing_signatures(path_hash_pairs, session)
            return tuple(map(lambda path_hash: FileKey(*path_hash), missing_signatures))


class DBSignaturesTask(PipelineTask):
    """Store fingerprints to database for files with prefix."""

    prefix: str = luigi.Parameter(default=".")

    def requires(self):
        return SignaturesTask(
            config=self.config,
            prefix=self.prefix,
        )

    def output(self):
        if not self.config.database.use:
            return ConstTarget(exists=True)
        return DBSignaturesTarget(
            keys=self.pipeline.coll.iter_keys(prefix=self.prefix),
            database=self.pipeline.database,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Storing fingerprint to database for %s file with prefix '%s'",
            len(target.missing_keys),
            self.prefix,
        )

        store_database_signatures(
            file_keys=target.missing_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


class DBSignaturesByPathListFileTask(PipelineTask):
    """Store fingerprints to the database for paths specified in the given text file."""

    path_list_file: str = luigi.Parameter()

    def requires(self):
        return SignaturesByPathListFileTask(
            config=self.config,
            path_list_file=self.path_list_file,
        )

    def output(self):
        if not self.config.database.use:
            return ConstTarget(exists=True)
        return DBSignaturesTarget(
            keys=KeyIter.from_file(self.pipeline.coll, self.path_list_file),
            database=self.pipeline.database,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Storing fingerprint to database for %s files from the list '%s'",
            len(target.missing_keys),
            self.path_list_file,
        )

        store_database_signatures(
            file_keys=target.missing_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


class DBSignaturesByPathListTask(PipelineTask):
    """Store fingerprints to the database for files from the given list.

    Suitable for small file lists.
    """

    path_list: str = luigi.ListParameter()

    def requires(self):
        return SignaturesByPathListTask(
            config=self.config,
            path_list=self.path_list,
        )

    def output(self):
        if not self.config.database.use:
            return ConstTarget(exists=True)
        return DBSignaturesTarget(
            keys=KeyIter.from_paths(self.pipeline.coll, self.path_list),
            database=self.pipeline.database,
        )

    def run(self):
        target = self.output()
        self.logger.info(
            "Storing fingerprint to database for %s files from the list: %s",
            len(target.missing_keys),
            self.path_list,
        )

        store_database_signatures(
            file_keys=target.missing_keys,
            pipeline=self.pipeline,
            progress=self.progress,
            logger=self.logger,
        )


def store_database_signatures(
    file_keys: Collection[FileKey],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = logging.getLogger(__name__),
):
    """Ensure result database contains signatures for all given files."""

    if not pipeline.config.database.use:
        logger.info("Database is disabled. Skipping database signatures update...")
        progress.complete()
        return

    # Skip step if required results already exist
    if not file_keys:
        logger.info("Database contains all required signatures. Skipping...")
        progress.complete()
        return

    # Save signatures to database if needed
    logger.info("Saving signatures to the database for %s", len(file_keys))
    signatures = bulk_read(pipeline.repr_storage.signature, select=file_keys)
    pipeline.result_storage.add_signatures((key.path, key.hash, dumps(sig)) for key, sig in signatures.items())

    logger.info("Done saving %s signatures to database.", len(file_keys))
    progress.complete()
