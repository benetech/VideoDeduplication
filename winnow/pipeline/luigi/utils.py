import logging
import logging.config
import os
import shutil
from glob import glob
from os import PathLike, fspath
from pathlib import Path
from typing import List, Tuple, Union, IO, AnyStr, Dict

import numpy as np
import pandas as pd
from dataclasses import astuple
from typing.io import BinaryIO, TextIO

from winnow.duplicate_detection.neighbors import FeatureVector, DetectedMatch
from winnow.pipeline.luigi.platform import Match
from winnow.pipeline.progress_monitor import ProgressBar, ProgressMonitor, LazyProgress
from winnow.storage.file_key import FileKey
from winnow.utils.cli import create_pipeline


class FileKeyDF:
    """FileKeys-holding data-frame utils."""

    columns = ("path", "hash")

    @staticmethod
    def make(
        *,
        file_keys: List[FileKey] = None,
        tuples: List[Tuple[str, str]] = None,
        progress: ProgressMonitor = ProgressMonitor.NULL,
    ) -> pd.DataFrame:
        """Create DataFrame with file keys from tuples."""
        if file_keys is not None and tuples is not None:
            raise ValueError("Should specify either file_keys or tuples")
        if file_keys is not None:
            tuples = []
            progress = LazyProgress(progress.scale(len(file_keys)))
            for file_key in file_keys:
                tuples.append(astuple(file_key))
                progress.increase(1)
        result = pd.DataFrame(tuples, columns=FileKeyDF.columns)
        progress.complete()
        return result

    @staticmethod
    def to_file_keys(
        file_keys_df: pd.DataFrame,
        progress: ProgressMonitor = ProgressMonitor.NULL,
    ) -> List[FileKey]:
        """
        Convert file-keys data-frame to a new List with FileKey
        """
        progress = LazyProgress(progress.scale(len(file_keys_df.index)))
        result = []
        for entry in file_keys_df.itertuples():
            result.append(FileKey(path=entry.path, hash=entry.hash))
            progress.increase(1)
        progress.complete()
        return result

    @staticmethod
    def make_index_to_key_dict(
        file_keys_df: pd.DataFrame,
        progress: ProgressMonitor = ProgressMonitor.NULL,
    ) -> Dict[int, FileKey]:
        """
        Convert file-keys data-frame to a new index->FileKey mapping.
        """
        progress = LazyProgress(progress.scale(len(file_keys_df.index)))
        result = {}
        for entry in file_keys_df.itertuples():
            result[entry.Index] = FileKey(path=entry.path, hash=entry.hash)
            progress.increase(1)
        progress.complete()
        return result

    @staticmethod
    def make_key_to_index_dict(
        file_keys_df: pd.DataFrame,
        progress: ProgressMonitor = ProgressMonitor.NULL,
    ) -> Dict[int, FileKey]:
        """
        Convert file-keys data-frame to a new FileKey->Index mapping.
        """
        progress = LazyProgress(progress.scale(len(file_keys_df.index)))
        result = {}
        for entry in file_keys_df.itertuples():
            result[FileKey(path=entry.path, hash=entry.hash)] = entry.Index
            progress.increase(1)
        progress.complete()
        return result

    @staticmethod
    def from_index_to_key_dict(
        file_keys: Dict[int, FileKey],
        progress: ProgressMonitor = ProgressMonitor.NULL,
    ) -> pd.DataFrame:
        """Convert index->FileKey dict to file-keys DataFrame."""
        tuples = [None] * len(file_keys)
        progress = LazyProgress(progress.scale(len(file_keys)))
        for node_id, file_key in file_keys.items():
            tuples[node_id] = astuple(file_key)
            progress.increase(1)
        file_keys_df = FileKeyDF.make(tuples=tuples)
        progress.complete()
        return file_keys_df

    @staticmethod
    def read_csv(file: Union[str, Path, IO[AnyStr]], **kwargs) -> pd.DataFrame:
        """Read matches DataFrame from csv file."""
        matches_df = pd.read_csv(file, index_col=0, **kwargs)
        matches_df.fillna("", inplace=True)
        return matches_df


class MatchesDF:
    """
    Collection of utilities to work with DataFrames with
    detected matches. DetectedMatch keys are expected to
    be a FileKeys of local files.
    """

    columns = (
        "query_video",
        "query_sha256",
        "match_video",
        "match_sha256",
        "distance",
    )

    @staticmethod
    def read_csv(file: Union[str, Path, IO[AnyStr]], **kwargs) -> pd.DataFrame:
        """Read matches DataFrame from csv file."""
        matches_df = pd.read_csv(file, index_col=0, **kwargs)
        matches_df.fillna("", inplace=True)
        return matches_df

    @staticmethod
    def make(matches: List[DetectedMatch], progress: ProgressMonitor = ProgressMonitor.NULL) -> pd.DataFrame:
        """Create DataFrame with file matches."""

        def entry(detected_match: DetectedMatch):
            """Flatten (query_key, match_key, dist) match entry."""
            source, target = detected_match.needle_key, detected_match.haystack_key
            return source.path, source.hash, target.path, target.hash, detected_match.distance

        entries = []
        progress = LazyProgress(progress.scale(len(matches)))
        for match in matches:
            entries.append(entry(match))
            progress.increase(1)

        matches_df = pd.DataFrame(entries, columns=MatchesDF.columns)
        progress.complete()
        return matches_df

    @staticmethod
    def to_matches(matches_df: pd.DataFrame, progress: ProgressMonitor = ProgressMonitor.NULL):
        """Convert matches DataFrame to list of matches."""
        progress = LazyProgress(progress.scale(total_work=len(matches_df.index)))
        result = []
        for row in matches_df.itertuples():
            match = Match(
                source=FileKey(path=row.query_video, hash=row.query_sha256),
                target=FileKey(path=row.match_video, hash=row.match_sha256),
                distance=row.distance,
            )
            result.append(match)
            progress.increase(1)
        progress.complete()
        return result


def normalize_fingerprint_storage(config_path: str):
    """Normalize fingerprint storage format."""
    log_config_path = "./logging.conf"
    if os.path.isfile(log_config_path):
        logging.config.fileConfig(log_config_path)

    pipeline = create_pipeline(config_path=config_path)
    logger = logging.getLogger("winnow")

    signature_store = pipeline.repr_storage.signature
    storage_folder = signature_store.directory
    logger.info("Normalizing signature storage in %s", storage_folder)

    search_suffix = ".npy"
    expected_suffix = "_vgg_features.npy"
    search_pattern = os.path.join(storage_folder, f"**/*{search_suffix}")
    sig_files = list(filter(os.path.isfile, glob(search_pattern, recursive=True)))
    logger.info("Found %s candidate files", len(sig_files))

    changed = 0
    progress = ProgressBar(unit=" files")
    progress.scale(len(sig_files))
    portion, portion_size = 0, int(len(sig_files) ** 0.5)
    for file_path in sig_files:
        if not file_path.endswith(expected_suffix):
            new_path = file_path[: -len(search_suffix)] + expected_suffix
            shutil.move(file_path, new_path)
            changed += 1
        portion += 1
        if portion >= portion_size:
            progress.increase(portion)
            portion = 0
    progress.complete()
    logger.info("Normalized %s files", changed)


def prepare_ccweb(config_path: str):
    """Prepare ccweb fingerprints."""
    log_config_path = "./logging.conf"
    if os.path.isfile(log_config_path):
        logging.config.fileConfig(log_config_path)

    pipeline = create_pipeline(config_path=config_path)
    logger = logging.getLogger("winnow")

    file_labels_csv = os.path.join(pipeline.config.repr.directory, "vcdb_files_labels.csv")
    logger.info("Loading labeled ccweb videos list %s", file_labels_csv)
    file_labels = pd.read_csv(file_labels_csv)
    logger.info("Loaded %s labeled file names", len(file_labels.index))

    logger.info("Creating file-keys dataframe")
    file_keys = []
    for entry in file_labels.itertuples():
        file_keys.append((os.path.join(entry.label, entry.basename), ""))
    file_keys_dataframe = pd.DataFrame(file_keys, columns=("path", "hash"))
    logger.info("Created file-keys dataframe")

    condensed_file_keys_path = os.path.join(pipeline.config.repr.directory, "condensed_fingerprints.files.csv")
    logger.info("Saving condensed file-keys to %s", condensed_file_keys_path)
    file_keys_dataframe.to_csv(condensed_file_keys_path)
    logger.info("Saving file-keys is done")


def read_fingerprints(
    fingerprins_file: BinaryIO,
    file_keys_file: TextIO,
    logger: logging.Logger,
) -> List[FeatureVector]:
    """Read condensed fingerprints."""

    fingerprints = np.load(fingerprins_file, allow_pickle=False)
    file_keys = pd.read_csv(file_keys_file)
    if len(fingerprints) != len(file_keys.index):
        raise Exception(
            "Inconsistent condensed vectors size: len(vectors) = %s != len(files) = %s",
            len(fingerprints),
            len(file_keys.index),
        )

    logger.info("Preparing fingerprints")

    progress = ProgressBar(unit=" fingerprints")
    progress.scale(len(file_keys.index))
    portion, portion_size = 0, int(len(file_keys.index) ** 0.5)
    result = []
    for fingerprint, row in zip(fingerprints, file_keys.itertuples()):
        result.append(FeatureVector(key=FileKey(path=row.path, hash=row.hash), features=fingerprint))
        portion += 1
        if portion >= portion_size:
            progress.increase(portion)
            portion = 0
    progress.complete()
    return result


def random_mask(total_size, true_count) -> np.ndarray:
    """Create random True/False mask."""
    mask = np.full(total_size, fill_value=False)
    mask[: min(true_count, len(mask))] = True
    np.random.shuffle(mask)
    return mask


def select_random_vectors(vectors: np.ndarray, max_count: int) -> np.ndarray:
    """Select subset of vectors."""
    if max_count <= 0:
        return vectors
    selected = random_mask(len(vectors), max_count)
    return vectors[selected]


def without_ext(path: PathLike) -> str:
    """File path without extension."""
    result, _ = os.path.splitext(fspath(path))
    return result
