import collections
import logging
import os
from datetime import datetime
from typing import List, Union, Tuple, Optional, Sequence

import luigi
import luigi.format
import luigi.setup_logging
import numpy as np
import cudf as pd
from dataclasses import asdict, astuple, dataclass

from winnow.collection.file_collection import FileCollection
from winnow.duplicate_detection.neighbors import FeatureVector
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.signatures import SignaturesTask
from winnow.pipeline.luigi.targets import FileGroupTarget
from winnow.pipeline.luigi.utils import FileKeyDF
from winnow.pipeline.progress_monitor import ProgressBar, ProgressMonitor, LazyProgress, BaseProgressMonitor
from winnow.storage.base_repr_storage import BaseReprStorage
from winnow.storage.file_key import FileKey


@dataclass
class CondensedFingerprints:
    """
    Condensed fingerprints collection.

    This class represents an in-memory collection of fingerprints in which all
    fingerprints are stored in a single numpy.ndarray (and thus they are more
    "condensed").

    The sole purpose for "condensing" fingerprints is to speed up reading large
    collections of fingerprints from a disc storage. Reading a single ndarray
    from a file could be performed in a split seconds, while reading millions
    of files may take ~10 minutes.

    For each element of `self.fingerprints` array there is a corresponding
    item in the file_keys data-frame (with the same index).
    """

    fingerprints: np.ndarray
    file_keys_df: pd.DataFrame

    def to_feature_vectors(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> List[FeatureVector]:
        """
        Convert condensed fingerprints into list of `FeatureVector`s

        FeatureVector is a dataset item, consumed by the neighbor detection algorithm.
        """
        progress = LazyProgress(progress.scale(len(self.file_keys_df.index), unit="fingerprints"))
        result = []
        for fingerprint, row in zip(self.fingerprints, self.file_keys_df.to_pandas().itertuples()):
            result.append(FeatureVector(key=FileKey(path=row.path, hash=row.hash), features=fingerprint))
            progress.increase(1)
        progress.complete()
        return result

    def to_file_keys(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> List[FileKey]:
        """
        Convert file-keys data-frame to
        """
        return FileKeyDF.to_file_keys(self.file_keys_df, progress)

    def __len__(self):
        """Get fingerprints count."""
        return len(self.fingerprints)

    def __getitem__(self, item) -> Union["CondensedFingerprints", Tuple[FileKey, np.ndarray]]:
        """Get item or a slice form the CondensedFingerprints collection."""
        if isinstance(item, (slice, collections.Collection)):
            return CondensedFingerprints(fingerprints=self.fingerprints[item], file_keys_df=self.file_keys_df[item])
        return FileKey(**self.file_keys_df.loc[item]), self.fingerprints[item]

    @staticmethod
    def read_all(
        storage: BaseReprStorage,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
        logger: logging.Logger = logging.getLogger(__name__),
        expected_shape=(500,),
    ) -> "CondensedFingerprints":
        """Read all fingerprints from representation storage."""
        progress.scale(1.0)

        logger.info("Discovering all existing fingerprints")
        file_keys = list(storage.list())
        progress.increase(0.1)
        logger.info("Found %s fingerprints", len(file_keys))

        return CondensedFingerprints.read_entries(
            file_keys=file_keys,
            storage=storage,
            progress=progress.remaining(),
            logger=logger,
            expected_shape=expected_shape,
        )

    @staticmethod
    def read_entries(
        file_keys: Sequence[FileKey],
        storage: BaseReprStorage,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
        logger: logging.Logger = None,
        expected_shape=(500,),
    ) -> "CondensedFingerprints":
        """Condense the given file keys."""
        read_progress = progress.scale(len(file_keys))
        read_progress = LazyProgress(ProgressBar(read_progress, unit=" fingerprints"))

        fingerprints = []
        file_key_tuples = []

        for file_key in file_keys:
            try:
                fingerprint = storage.read(file_key)
                if fingerprint.shape == expected_shape:
                    fingerprints.append(fingerprint)
                    file_key_tuples.append(astuple(file_key))
                else:
                    logger.error("Unexpected fingerprint shape %s of file %s", fingerprint.shape, file_key)
            except Exception:
                logger.exception("Error loading fingerprint from %s", asdict(file_key))
            read_progress.increase(1)
        read_progress.complete()

        logger.info("Creating ndarray with fingerprints")
        fingerprints = np.array(fingerprints)
        logger.info("Creating file-keys DataFrame")
        file_keys_df = FileKeyDF.make(tuples=file_key_tuples)
        logger.info("Creating file-keys DataFrame")
        return CondensedFingerprints(fingerprints=fingerprints, file_keys_df=file_keys_df)

    @staticmethod
    def read_files(
        fingerprints_file: str, file_keys_file: str, progress: BaseProgressMonitor = ProgressMonitor.NULL
    ) -> "CondensedFingerprints":
        """Read condensed fingerprints from files."""
        progress.scale(1.0)
        fingerprints = np.load(fingerprints_file, allow_pickle=False)
        progress.increase(0.5)
        file_keys_df = FileKeyDF.read_csv(file_keys_file)
        progress.increase(0.5)
        if len(fingerprints) != len(file_keys_df.index):
            raise Exception(
                "Inconsistent condensed vectors size: len(vectors) = %s != len(files) = %s",
                len(fingerprints),
                len(file_keys_df.index),
            )
        progress.complete()
        return CondensedFingerprints(fingerprints=fingerprints, file_keys_df=file_keys_df)

    @staticmethod
    def update(
        old: "CondensedFingerprints",
        new: "CondensedFingerprints",
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
        logger: logging.Logger = logging.getLogger(__name__),
    ) -> "CondensedFingerprints":
        """Concatenate two condensed fingerprints collections."""
        if len(old) == 0:
            progress.complete()
            return new

        if len(new) == 0:
            progress.complete()
            return old

        progress.scale(1.0)
        new_paths = set(new.file_keys_df.to_pandas()["path"])
        not_updated = np.array(~old.file_keys_df.to_pandas()["path"].isin(new_paths))
        file_keys_df = old.file_keys_df[not_updated]
        fingerprints = old.fingerprints[not_updated]
        logger.info("%s previously condensed fingerprints were not updated", len(fingerprints))
        progress.increase(0.5)

        file_keys_df = pd.concat([file_keys_df, new.file_keys_df], ignore_index=True)
        fingerprints = np.concatenate((fingerprints, new.fingerprints))
        logger.info("Concatenated existing data with new fingerprints")
        progress.complete()
        return CondensedFingerprints(fingerprints=fingerprints, file_keys_df=file_keys_df)


class CondensedFingerprintsTarget(FileGroupTarget):
    """
    Luigi task target representing CondensedFingerprints saved to a disc storage.

    CondensedFingerprints are stored as two files:
      1. <name>.npy file with condensed fingerprints
      2. <name>.files.csv file with the corresponding file keys in the same order.
    """

    def __init__(self, output_directory: str, prefix: str, name: str, coll: FileCollection):
        super().__init__(
            common_prefix=(os.path.normpath(os.path.join(output_directory, prefix, name))),
            suffixes=(".npy", ".files.csv"),
            need_updates=lambda time: coll.any(prefix=prefix, min_mtime=time),
        )

    def write(self, condensed: CondensedFingerprints, time: datetime = None):
        """Save condensed fingerprints."""
        fingerprints_path, keys_path = self.suggest_paths(time)
        fingerprints_target = luigi.LocalTarget(fingerprints_path, format=luigi.format.Nop)
        keys_target = luigi.LocalTarget(keys_path)
        with fingerprints_target.open("w") as fingerprints_out:
            np.save(fingerprints_out, condensed.fingerprints)
            condensed.file_keys_df.to_csv(keys_path)

    def read(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> Optional[CondensedFingerprints]:
        """Read condensed fingerprints."""
        progress.scale(1.0)
        paths, _ = self.latest_result
        if paths is None:
            return None
        progress.increase(0.1)
        fingerprints_path, file_keys_path = paths
        return CondensedFingerprints.read_files(fingerprints_path, file_keys_path, progress.remaining())


class CondenseFingerprintsTask(PipelineTask):
    """Condense fingerprints from the representation storage."""

    prefix: str = luigi.Parameter(default=".")
    fingerprint_size: int = luigi.IntParameter(default=500)
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def run(self):
        target = self.output()
        self.logger.info("Reading existing condensed fingerprints")
        previous_results_paths, previous_results_time = target.latest_result
        previous_results = target.read(self.progress.subtask(0.1))
        loaded_count = len(previous_results) if previous_results is not None else 0
        self.logger.info("Loaded %s previously condensed fingerprints", loaded_count)

        new_results_time = self.pipeline.coll.max_mtime(prefix=self.prefix)
        since_time = previous_results_time or "the very beginning"
        self.logger.info("Collecting file-keys since %s", since_time)
        new_keys = list(
            self.pipeline.coll.iter_keys(
                prefix=self.prefix,
                min_mtime=previous_results_time,
                max_mtime=new_results_time,
            )
        )
        self.logger.info("Collected %s file keys", len(new_keys))

        self.logger.info("Reading fingerprints")
        expected_shape = (self.fingerprint_size,)
        condensed = CondensedFingerprints.read_entries(
            file_keys=new_keys,
            storage=self.pipeline.repr_storage.signature,
            logger=self.logger,
            expected_shape=expected_shape,
            progress=self.progress.subtask(0.7),
        )
        self.logger.info("Loaded %s new fingerprints.", len(condensed))

        if previous_results is not None:
            self.logger.info("Merging new fingerprints list with the existing %s fingerprints", len(previous_results))
            condensed = CondensedFingerprints.update(previous_results, condensed, progress=self.progress.subtask(0.1))
            self.logger.info("Merged previous results with new fingerprints.")

        self.logger.info("Writing %s fingerprints to %s", len(condensed), target.suggest_paths(new_results_time))
        
        target.write(condensed, new_results_time)

        if self.clean_existing and previous_results_paths is not None:
            for path in previous_results_paths:
                self.logger.info("Removing previous results: %s", path)
                os.remove(path)

    def output(self):
        return CondensedFingerprintsTarget(
            output_directory=os.path.join(self.output_directory, "condensed_fingerprints"),
            prefix=self.prefix,
            name="condensed_fingerprints",
            coll=self.pipeline.coll,
        )

    def requires(self):
        return SignaturesTask(config=self.config, prefix=self.prefix)
