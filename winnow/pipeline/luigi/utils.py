import json
import logging
from os import PathLike
from pathlib import Path
from typing import List, Tuple, Union, IO, AnyStr, Dict, Collection, Iterator, Iterable

import numpy as np
# import pandas as pd
import cudf as pd
from dataclasses import astuple

from winnow.collection.file_collection import FileCollection
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
        for entry in file_keys_df.to_pandas().itertuples():
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
        for entry in file_keys_df.to_pandas().itertuples():
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
        for entry in file_keys_df.to_pandas().itertuples():
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
    def make(matches: Collection, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> pd.DataFrame:
        """Create DataFrame with file matches."""

        def entry(detected_match):
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
        for row in matches_df.to_pandas().to_pandas().itertuples():
            match = Match(
                source=FileKey(path=row.query_video, hash=row.query_sha256),
                target=FileKey(path=row.match_video, hash=row.match_sha256),
                distance=row.distance,
            )
            result.append(match)
            progress.increase(1)
        progress.complete()
        return result


class ScenesDF:
    """Collection of utilities to work with DataFrames with detected scenes."""

    columns = ("path", "hash", "scene_duration_seconds", "video_duration_seconds")

    @staticmethod
    def read_csv(file: Union[str, Path, IO[AnyStr]], **kwargs) -> pd.DataFrame:
        """Read matches DataFrame from csv file."""
        scenes_df = pd.read_csv(file, index_col=0, **kwargs).to_pandas()
        scenes_df.fillna("", inplace=True)
        scenes_df["scene_duration_seconds"] = scenes_df["scene_duration_seconds"].apply(json.loads)
        return scenes_df

    @staticmethod
    def merge(
        old_scenes_df: pd.DataFrame,
        new_scenes_df: pd.DataFrame,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
        logger: logging.Logger = logging.getLogger(f"{__name__}.ScenesDF.merge"),
    ) -> pd.DataFrame:
        """Concatenate two scenes metadata collections."""
        if len(old_scenes_df) == 0:
            progress.complete()
            return new_scenes_df

        if len(new_scenes_df) == 0:
            progress.complete()
            return old_scenes_df

        progress.scale(1.0)
        new_paths = set(new_scenes_df["path"])
        not_updated_df = old_scenes_df[np.array(~old_scenes_df["path"].isin(new_paths))]
        logger.debug("%s scene metadata items were not updated", len(not_updated_df))
        progress.increase(0.5)

        updated_scenes_df = pd.concat([not_updated_df, new_scenes_df], ignore_index=True)
        logger.debug("Concatenated existing metadata with %s new scenes", len(new_scenes_df))
        progress.complete()
        return updated_scenes_df


def prefix(value: str) -> str:
    """Snake-case prefix."""
    if not value:
        return ""
    return f"{value}_"


class KeyIter:
    """FileKey iterator builder."""

    @staticmethod
    def from_file(coll: FileCollection, path_list_file: Union[str, PathLike]) -> Iterator[FileKey]:
        """Iterate over file keys from file."""
        with open(path_list_file, "r") as file:
            for path in file.readlines():
                file_key = coll.file_key(path.strip(), raise_exception=False)
                if file_key is not None:
                    yield file_key

    @staticmethod
    def from_paths(coll: FileCollection, paths: Iterable[str]) -> Iterator[FileKey]:
        """Iterate over file keys from the collection path list."""
        for path in paths:
            file_key = coll.file_key(path, raise_exception=False)
            if file_key is not None:
                yield file_key
