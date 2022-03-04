import os
from os import PathLike, fspath
from pathlib import Path
from typing import List, Tuple, Union, IO, AnyStr, Dict, Collection

import numpy as np
import pandas as pd
from dataclasses import astuple

from winnow.duplicate_detection.neighbors import DetectedMatch
from winnow.pipeline.luigi.platform import Match
from winnow.pipeline.progress_monitor import ProgressMonitor, LazyProgress, BaseProgressMonitor
from winnow.storage.file_key import FileKey


class FileKeyDF:
    """FileKeys-holding data-frame utils."""

    columns = ("path", "hash")

    @staticmethod
    def make(
        *,
        file_keys: List[FileKey] = None,
        tuples: List[Tuple[str, str]] = None,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
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
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
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
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
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
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> Dict[FileKey, int]:
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
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
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
    def make(matches: Collection[DetectedMatch], progress: BaseProgressMonitor = ProgressMonitor.NULL) -> pd.DataFrame:
        """Create DataFrame with file matches."""

        def entry(detected_match: DetectedMatch):
            """Flatten (query_key, match_key, dist) match entry."""
            source, target = detected_match.needle_key, detected_match.haystack_key
            return source.path, source.hash, target.path, target.hash, detected_match.distance

        entries = []
        progress = LazyProgress(progress.scale(len(matches), unit="matches"))
        for match in matches:
            entries.append(entry(match))
            progress.increase(1)

        matches_df = pd.DataFrame(entries, columns=MatchesDF.columns)
        progress.complete()
        return matches_df

    @staticmethod
    def to_matches(matches_df: pd.DataFrame, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> List[Match]:
        """Convert matches DataFrame to list of matches."""
        progress = LazyProgress(progress.scale(total_work=len(matches_df.index), unit="matches"))
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


def random_mask(total_size, true_count) -> np.ndarray:
    """Create random True/False mask."""
    mask = np.full(total_size, fill_value=False)
    mask[: min(true_count, len(mask))] = True
    np.random.shuffle(mask)
    return mask


def without_ext(path: PathLike) -> str:
    """File path without extension."""
    result, _ = os.path.splitext(fspath(path))
    return result


def prefix(value: str) -> str:
    """Snake-case prefix."""
    if not value:
        return ""
    return f"{value}_"
