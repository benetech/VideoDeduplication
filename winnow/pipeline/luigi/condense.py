import collections
import logging
import os
from typing import List, Union, Tuple

import luigi
import luigi.format
import luigi.setup_logging
import numpy as np
import pandas as pd
from cached_property import cached_property
from dataclasses import asdict, astuple, dataclass

from winnow.duplicate_detection.neighbors import FeatureVector
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.utils import FileKeyDF
from winnow.pipeline.progress_monitor import ProgressBar, ProgressMonitor, LazyProgress
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

    def to_feature_vectors(self, progress: ProgressMonitor = ProgressMonitor.NULL) -> List[FeatureVector]:
        """
        Convert condensed fingerprints into list of `FeatureVector`s

        FeatureVector is a dataset item, consumed by the neighbor detection algorithm.
        """
        progress = LazyProgress(progress.scale(len(self.file_keys_df.index)))
        result = []
        for fingerprint, row in zip(self.fingerprints, self.file_keys_df.itertuples()):
            result.append(FeatureVector(key=FileKey(path=row.path, hash=row.hash), features=fingerprint))
            progress.increase(1)
        progress.complete()
        return result

    def to_file_keys(self, progress: ProgressMonitor = ProgressMonitor.NULL) -> List[FileKey]:
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
        progress: ProgressMonitor = ProgressMonitor.NULL,
        logger: logging.Logger = None,
        expected_shape=(500,),
    ):
        """Read all fingerprints from representation storage."""
        logger = logger or logging.getLogger(__name__)
        progress.scale(1.0)

        logger.info("Discovering fingerprints")
        file_keys = list(storage.list())
        logger.info("Found %s fingerprings", len(file_keys))

        progress.increase(0.01)

        read_progress = progress.subtask(progress.total * progress.progress).scale(len(file_keys))
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
        return CondensedFingerprints(fingerprints=fingerprints, file_keys_df=file_keys_df)


class CondensedFingerprintsTarget(luigi.Target):
    """
    Luigi task target representing CondensedFingerprints saved to a disc storage.

    CondensedFingerprints are stored as two files:
      1. <name>.npy file with condensed fingerprints
      2. <name>.files.csv file with the conrresponding file keys in the same order.
    """

    def __init__(self, output_directory: str, name: str):
        self._output_directory: str = output_directory
        self._name: str = name

    @cached_property
    def directory(self) -> str:
        """Get output directory path."""
        return self._output_directory

    @cached_property
    def fingerprints_file_path(self) -> str:
        """Get fingerprint .npy file path."""
        return os.path.join(self._output_directory, f"{self._name}.npy")

    @cached_property
    def keys_file_path(self) -> str:
        """Get file-kyes file path."""
        return os.path.join(self._output_directory, f"{self._name}.files.csv")

    @cached_property
    def fingerprints_target(self) -> luigi.LocalTarget:
        """Get partial target for local .npy fingerprint file."""
        return luigi.LocalTarget(self.fingerprints_file_path, format=luigi.format.Nop)

    @cached_property
    def keys_target(self) -> luigi.LocalTarget:
        """Get partial target for local file-keys .csv file."""
        return luigi.LocalTarget(self.keys_file_path)

    def exists(self) -> bool:
        return self.fingerprints_target.exists() and self.keys_target.exists()

    def write(self, condensed: CondensedFingerprints):
        """Save condensed fingerprints."""
        with self.fingerprints_target.open("w") as fingerprints_out, self.keys_target.open("w") as keys_out:
            np.save(fingerprints_out, condensed.fingerprints)
            condensed.file_keys_df.to_csv(keys_out)

    def read(self, progress: ProgressMonitor = ProgressMonitor.NULL) -> CondensedFingerprints:
        """Read condensed fingerprints."""
        progress.scale(1.0)
        with self.fingerprints_target.open("r") as fingerprints_file, self.keys_target.open("r") as file_keys_file:
            fingerprints = np.load(fingerprints_file, allow_pickle=False)
            progress.increase(0.5)
            file_keys_df = FileKeyDF.read_csv(file_keys_file)
            progress.increase(0.5)
        progress.complete()
        if len(fingerprints) != len(file_keys_df.index):
            raise Exception(
                "Inconsistent condensed vectors size: len(vectors) = %s != len(files) = %s",
                len(fingerprints),
                len(file_keys_df.index),
            )
        return CondensedFingerprints(fingerprints=fingerprints, file_keys_df=file_keys_df)

    def read_fingerprints(self) -> np.ndarray:
        """Read only fingerprints as numpy.ndarray."""
        with self.fingerprints_target.open("r") as fingerprints_file:
            return np.load(fingerprints_file, allow_pickle=False)

    def read_file_keys_df(self) -> pd.DataFrame:
        """Read only file keys as DataFrame."""
        with self.keys_target.open("r") as file_keys_file:
            return FileKeyDF.read_csv(file_keys_file)

    def read_file_keys(self, progress: ProgressMonitor = ProgressMonitor.NULL) -> List[FileKey]:
        """Read only file-keys as a list."""
        file_keys_df = self.read_file_keys_df()
        return FileKeyDF.to_file_keys(file_keys_df, progress)


class CondenseFingerprintsTask(PipelineTask):
    """Condense fingerprints from the representation storage."""

    fingerprint_size = luigi.IntParameter(default=500)

    def run(self):
        self.logger.info("Reading fingerprints")
        expected_shape = (self.fingerprint_size,)
        condensed = CondensedFingerprints.read_all(
            storage=self.pipeline.repr_storage.signature,
            logger=self.logger,
            expected_shape=expected_shape,
            progress=ProgressMonitor(),
        )
        self.logger.info("Found %s fingerprints", len(condensed))

        target = self.output()
        output_directory = self.pipeline.config.repr.directory
        self.logger.info("Writing condensed fingerprints to %s", output_directory)
        target.write(condensed)

    def output(self):
        return CondensedFingerprintsTarget(output_directory=self.output_directory, name="condensed_fingerprints")
