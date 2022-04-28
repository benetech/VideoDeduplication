import abc
import logging
import os
from datetime import datetime
from typing import Optional, Sequence, Dict, Tuple, Set, Iterator

import luigi
import pandas as pd
from cached_property import cached_property
from dataclasses import replace
from sqlalchemy import func

from db import Database
from db.schema import TaskLogRecord
from remote.model import RemoteFingerprint
from winnow.collection.file_collection import FileCollection
from winnow.duplicate_detection.neighbors import DetectedMatch, FeatureVector
from winnow.duplicate_detection.neighbors_rapids import NeighborMatcher
from winnow.pipeline.luigi.annoy_index import AnnoyIndexTask
from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprints
from winnow.pipeline.luigi.platform import PipelineTask, ConstTarget
from winnow.pipeline.luigi.signatures import SignaturesByPathListFileTask
from winnow.pipeline.luigi.targets import FileGroupTarget
from winnow.pipeline.luigi.utils import MatchesDF
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.storage.remote_signatures_dao import RemoteMatch, RemoteSignaturesDAO, RemoteMatchesDAO, RemoteMatchesReport
from winnow.utils.brightness import get_brightness_estimation
from winnow.utils.files import PathTime, hash_file


class MatchesBaseTask(PipelineTask, abc.ABC):
    """Base task for all matches tasks."""

    haystack_prefix: str = luigi.Parameter(default=".")
    fingerprint_size: int = luigi.IntParameter(default=500)
    metric: str = luigi.Parameter(default="angular")
    n_trees: int = luigi.IntParameter(default=10)

    def run(self):
        feature_vectors = self.read_needles(self.progress.subtask(0.1))
        self.logger.info("Loaded %s needles")

        self.logger.info("Loading Approximate-Nearest-Neighbor index for files with prefix '%s'", self.haystack_prefix)
        neighbor_matcher = self.load_nn_matcher(self.progress.subtask(0.1))
        self.logger.info("Loaded haystack of %s fingerprints", len(neighbor_matcher.haystack_keys))

        self.logger.info("Searching for the matches.")
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=self.config.proc.match_distance)
        self.progress.increase(0.6)
        self.logger.info("Found %s matches", len(matches))

        self.logger.info("Going to save %s matches", len(matches))
        self.save_matches(matches, self.progress.subtask(0.1))
        self.logger.info("Done!")

    @abc.abstractmethod
    def read_needles(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> Sequence[FeatureVector]:
        """Read needles fingerprints."""

    @abc.abstractmethod
    def save_matches(self, matches: Sequence[DetectedMatch], progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Save found matches to the destination storage."""

    @property
    @abc.abstractmethod
    def annoy_input(self) -> FileGroupTarget:
        """Get annoy index dependency input."""

    def load_nn_matcher(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> NeighborMatcher:
        """Load nearest-neighbors matcher."""
        return _load_nn(self.annoy_input, self.metric, progress)

    @cached_property
    def annoy_dependency(self) -> AnnoyIndexTask:
        """Annoy index task dependency."""
        return AnnoyIndexTask(
            config=self.config,
            prefix=self.haystack_prefix,
            fingerprint_size=self.fingerprint_size,
            metric=self.metric,
            n_trees=self.n_trees,
        )


class DBMatchesTarget(luigi.Target):
    """Represents file matches search results in the database.

    There is no way to determine task completion by looking only on existing matches.
    Thus, we rely on ``TaskLogRecord`` to make sure we are not repeating the same work
    multiple times.
    """

    def __init__(self, haystack_prefix: str, needles_prefix: str, database: Database, coll: FileCollection):
        self.haystack_prefix: str = haystack_prefix
        self.needles_prefix: str = needles_prefix
        self.database: Database = database
        self.coll: FileCollection = coll

    def exists(self):
        last_time = self.last_time
        if last_time is None:
            return False
        return last_time >= self.result_timestamp

    @property
    def last_time(self) -> Optional[datetime]:
        """Get the last log record."""
        with self.database.session_scope() as session:
            task_name = TaskLogRecord.task_name == DBMatchesTask.LOG_TASK_NAME
            haystack = TaskLogRecord.details[DBMatchesTask.LOG_HAYSTACK_ATTR].as_string() == self.haystack_prefix
            needles = TaskLogRecord.details[DBMatchesTask.LOG_NEEDLES_ATTR].as_string() == self.needles_prefix
            task_filters = (task_name, haystack, needles)
            last_time = session.query(func.max(TaskLogRecord.timestamp)).filter(*task_filters)
            latest = TaskLogRecord.timestamp == last_time
            record: TaskLogRecord = session.query(TaskLogRecord).filter(latest, *task_filters).one_or_none()
            if record is None:
                return None
            return record.timestamp

    def write_log(self):
        """Make sure we saved the indication that the task is already completed."""
        record = TaskLogRecord(
            task_name=DBMatchesTask.LOG_TASK_NAME,
            timestamp=self.result_timestamp,
            details={
                DBMatchesTask.LOG_HAYSTACK_ATTR: self.haystack_prefix,
                DBMatchesTask.LOG_NEEDLES_ATTR: self.needles_prefix,
            },
        )
        with self.database.session_scope() as session:
            session.add(record)

    @cached_property
    def result_timestamp(self) -> datetime:
        return max(
            self.coll.max_mtime(prefix=self.haystack_prefix),
            self.coll.max_mtime(prefix=self.needles_prefix),
        )


class DBMatchesTask(PipelineTask):
    """Populate database with file matches."""

    needles_prefix: str = luigi.Parameter(default=".")
    haystack_prefix: str = luigi.Parameter(default=".")
    fingerprint_size: int = luigi.IntParameter(default=500)
    metric: str = luigi.Parameter(default="angular")
    n_trees: int = luigi.IntParameter(default=10)

    # Task logs properties
    LOG_TASK_NAME = "MatchFilesTask"
    LOG_HAYSTACK_ATTR = "haystack_prefix"
    LOG_NEEDLES_ATTR = "needles_prefix"

    def run(self):
        target = self.output()

        annoy_input, condensed_input = self.input()
        self.logger.info("Reading condensed fingerprints")
        condensed: CondensedFingerprints = condensed_input.read(self.progress.subtask(0.05))
        self.logger.info("Loaded %s fingerprints", len(condensed))

        self.logger.info("Preparing feature-vectors for matching")
        feature_vectors = condensed.to_feature_vectors(self.progress.subtask(0.05))
        self.logger.info("Prepared %s feature-vectors for matching", len(feature_vectors))

        self.logger.info("Loading Nearest Neighbor matcher.")
        neighbor_matcher = _load_nn(annoy_input, self.metric, self.progress.subtask(0.05))
        self.logger.info("Loaded Nearest Neighbor matcher with %s entries.", len(neighbor_matcher.haystack_keys))

        self.logger.info("Searching for the matches.")
        distance = self.config.proc.match_distance
        matching = self.progress.subtask(0.6)
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=distance, progress=matching)
        self.logger.info("Found %s matches", len(matches))

        filtering_dark = self.progress.subtask(0.1).scale(1.0)
        if self.config.proc.filter_dark_videos:
            self.logger.info("Filtering dark videos with threshold %s", self.config.proc.filter_dark_videos_thr)
            file_keys = condensed.to_file_keys(progress=filtering_dark.subtask(0.2))
            matches, metadata = filter_dark(file_keys, matches, self.pipeline, filtering_dark.subtask(0.8), self.logger)
            self.logger.info("Saving file metadata")
            result_storage = self.pipeline.result_storage
            result_storage.add_metadata((key.path, key.hash, meta) for key, meta in metadata.items())
        filtering_dark.complete()

        def _entry(detected_match: DetectedMatch):
            """Flatten (query_key, match_key, dist) match entry."""
            query, match = detected_match.needle_key, detected_match.haystack_key
            return query.path, query.hash, match.path, match.hash, detected_match.distance

        self.logger.info("Saving %s matches to the database", len(matches))
        result_storage = self.pipeline.result_storage
        result_storage.add_matches(_entry(match) for match in matches)
        target.write_log()
        self.logger.info("Done!")

    def output(self):
        if not self.config.database.use:
            return ConstTarget(exists=True)
        return DBMatchesTarget(
            haystack_prefix=self.haystack_prefix,
            needles_prefix=self.needles_prefix,
            database=self.pipeline.database,
            coll=self.pipeline.coll,
        )

    def requires(self):
        yield AnnoyIndexTask(
            config=self.config,
            prefix=self.haystack_prefix,
            fingerprint_size=self.fingerprint_size,
            metric=self.metric,
            n_trees=self.n_trees,
        )
        yield CondenseFingerprintsTask(
            config=self.config,
            prefix=self.needles_prefix,
            fingerprint_size=self.fingerprint_size,
        )


class DBMatchesByFileListTask(PipelineTask):
    """Populate database with file matches for videos listed in a text file."""

    path_list_file: str = luigi.Parameter()
    fingerprint_size: int = luigi.IntParameter(default=500)
    metric: str = luigi.Parameter(default="angular")
    n_trees: int = luigi.IntParameter(default=10)
    max_matches: int = luigi.IntParameter(default=20)

    # Task logs properties
    LOG_TASK_NAME = "MatchFilesTask"
    LOG_HAYSTACK_ATTR = "haystack_prefix"
    LOG_NEEDLES_ATTR = "needles_prefix"

    def run(self):
        self.logger.info("Reading paths list from %s", self.path_list_file)
        with open(self.path_list_file, "r") as list_file:
            paths = list(map(str.strip, list_file.readlines()))
        self.progress.increase(0.1)
        self.logger.info("%s paths was loaded from %s", len(paths), self.path_list_file)

        self.logger.info("Reading fingerprints", len(paths))
        file_keys = list(map(self.pipeline.coll.file_key, paths))
        signatures = self.pipeline.repr_storage.signature
        feature_vectors = [FeatureVector(key=key, features=signatures.read(key)) for key in file_keys]
        self.progress.increase(0.1)
        self.logger.info("Loaded %s fingerprints", len(feature_vectors))

        max_distance = self.config.proc.match_distance
        self.logger.info("Performing match detection with max distance=%s.", max_distance)
        matching = self.progress.subtask(0.7)
        neighbor_matcher = NeighborMatcher(haystack=feature_vectors, max_matches=self.max_matches, metric=self.metric)
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=max_distance, progress=matching)
        self.logger.info("Found %s matches", len(matches))

        if self.config.proc.filter_dark_videos:
            self.logger.info("Filtering dark videos with threshold %s", self.config.proc.filter_dark_videos_thr)
            matches, metadata = filter_dark(file_keys, matches, self.pipeline, self.progress.subtask(0.03), self.logger)
            result_storage = self.pipeline.result_storage
            result_storage.add_metadata((key.path, key.hash, meta) for key, meta in metadata.items())
            self.progress.increase(0.03)

        def _entry(detected_match: DetectedMatch):
            """Flatten (query_key, match_key, dist) match entry."""
            query, match = detected_match.needle_key, detected_match.haystack_key
            return query.path, query.hash, match.path, match.hash, detected_match.distance

        self.logger.info("Saving %s matches to the database", len(matches))
        result_storage = self.pipeline.result_storage
        result_storage.add_matches(_entry(match) for match in matches)
        self.logger.info("Done!")

    def output(self):
        return ConstTarget(exists=False)

    def requires(self):
        SignaturesByPathListFileTask(config=self.config, path_list_file=self.path_list_file)


class MatchesReportTask(PipelineTask):
    """Find file matches and write results into CSV report."""

    needles_prefix: str = luigi.Parameter(default=".")
    haystack_prefix: str = luigi.Parameter(default=".")
    output_path: str = luigi.Parameter(default=None)
    timestamp_results: bool = luigi.BoolParameter(default=True)
    fingerprint_size: int = luigi.IntParameter(default=500)
    metric: str = luigi.Parameter(default="angular")
    n_trees: int = luigi.IntParameter(default=10)
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def run(self):
        annoy_input, condensed_input = self.input()
        self.logger.info("Reading condensed fingerprints")
        condensed: CondensedFingerprints = condensed_input.read(self.progress.subtask(0.05))
        self.logger.info("Loaded %s fingerprints", len(condensed))

        self.logger.info("Preparing feature-vectors for matching")
        feature_vectors = condensed.to_feature_vectors(self.progress.subtask(0.05))
        self.logger.info("Prepared %s feature-vectors for matching", len(feature_vectors))

        self.logger.info("Loading Nearest Neighbor matcher.")
        neighbor_matcher = _load_nn(annoy_input, self.metric, self.progress.subtask(0.05))
        self.logger.info("Loaded Nearest Neighbor matcher with %s entries.", len(neighbor_matcher.haystack_keys))

        self.logger.info("Searching for the matches.")
        distance = self.config.proc.match_distance
        matching = self.progress.subtask(0.6)
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=distance, progress=matching)
        self.logger.info("Found %s matches", len(matches))

        filtering_dark = self.progress.subtask(0.1).scale(1.0)
        if self.config.proc.filter_dark_videos:
            self.logger.info("Filtering dark videos with threshold %s", self.config.proc.filter_dark_videos_thr)
            file_keys = condensed.to_file_keys(progress=filtering_dark.subtask(0.2))
            matches, _ = filter_dark(file_keys, matches, self.pipeline, filtering_dark.subtask(0.8), self.logger)
        filtering_dark.complete()

        self.logger.info("Preparing file matches for saving")
        matches_df = MatchesDF.make(matches, self.progress.remaining())
        self.logger.info("Prepared %s file matches for saving", len(matches_df.index))

        self.logger.info("Saving matches report")

        self.save_matches_csv(matches_df)

        if self.clean_existing and self.previous_results is not None:
            self.logger.info("Removing previous results: %s", self.previous_results)
            os.remove(self.previous_results)

    def output(self):
        return luigi.LocalTarget(self.result_path)

    def requires(self):
        yield AnnoyIndexTask(
            config=self.config,
            prefix=self.haystack_prefix,
            fingerprint_size=self.fingerprint_size,
            metric=self.metric,
            n_trees=self.n_trees,
        )
        yield CondenseFingerprintsTask(
            config=self.config,
            prefix=self.needles_prefix,
            fingerprint_size=self.fingerprint_size,
        )

    def save_matches_csv(self, matches_df: pd.DataFrame):
        """Save matches to csv file."""
        
        dst = self.output().path
        parent = os.path.split(dst)[0]
        if not os.path.exists(parent):
            os.makedirs(parent)
        matches_df.to_pandas().to_csv(dst)

    @cached_property
    def result_timestamp(self) -> datetime:
        """Get result timestamp."""
        return max(
            self.pipeline.coll.max_mtime(prefix=self.haystack_prefix),
            self.pipeline.coll.max_mtime(prefix=self.needles_prefix),
        )

    @cached_property
    def result_path(self) -> str:
        """Get result path."""
        # Use output_path param if specified
        if self.output_path and not self.timestamp_results:
            return self.output_path
        if self.output_path and self.timestamp_results:
            return PathTime.stamp(self.output_path, time=self.result_timestamp)

        # Otherwise, suggest default output path
        match_distance = self.config.proc.match_distance
        default_filename = f"matches_{match_distance}dist.csv"
        default_output_path = os.path.join(self.output_directory, "matches", default_filename)
        if self.timestamp_results:
            return PathTime.stamp(default_output_path, time=self.result_timestamp)
        return default_output_path

    @cached_property
    def previous_results(self) -> Optional[str]:
        """Get previous results if any."""
        if self.timestamp_results:
            previous_path, _ = PathTime.previous(self.result_path)
            return previous_path
        return None


class MatchesByFileListTask(PipelineTask):
    """Find matches for videos listed in a text file."""

    path_list_file: str = luigi.Parameter()
    output_path: str = luigi.Parameter(default=None)
    metric: str = luigi.Parameter(default="cosine")
    max_matches: int = luigi.IntParameter(default=20)

    def requires(self):
        SignaturesByPathListFileTask(config=self.config, path_list_file=self.path_list_file)

    def output(self):
        return luigi.LocalTarget(self.result_path)

    def run(self):
        self.logger.info("Reading paths list from %s", self.path_list_file)
        with open(self.path_list_file, "r") as list_file:
            paths = list(map(str.strip, list_file.readlines()))
        self.progress.increase(0.1)
        self.logger.info("%s paths was loaded from %s", len(paths), self.path_list_file)

        self.logger.info("Reading fingerprints", len(paths))
        file_keys = list(map(self.pipeline.coll.file_key, paths))
        signatures = self.pipeline.repr_storage.signature
        feature_vectors = [FeatureVector(key=key, features=signatures.read(key)) for key in file_keys]
        self.progress.increase(0.1)
        self.logger.info("Loaded %s fingerprints", len(feature_vectors))

        max_distance = self.config.proc.match_distance
        self.logger.info("Performing match detection with max distance=%s.", max_distance)
        matching = self.progress.subtask(0.7)
        neighbor_matcher = NeighborMatcher(haystack=feature_vectors, max_matches=self.max_matches, metric=self.metric)
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=max_distance, progress=matching)
        self.logger.info("Found %s matches", len(matches))

        if self.config.proc.filter_dark_videos:
            self.logger.info("Filtering dark videos with threshold %s", self.config.proc.filter_dark_videos_thr)
            matches, _ = filter_dark(file_keys, matches, self.pipeline, self.progress.subtask(0.05), self.logger)

        self.logger.info("Preparing file matches for saving")
        matches_df = MatchesDF.make(matches, self.progress.remaining())
        self.logger.info("Prepared %s file matches for saving", len(matches_df.index))

        self.logger.info("Saving matches report to %s", self.result_path)
        with self.output().open("w") as output:
            matches_df.to_csv(output)

    @cached_property
    def result_path(self) -> str:
        """Resolved result report path."""
        if self.output_path is not None:
            return self.output_path
        list_hash = hash_file(self.path_list_file)[10:]
        filename = f"matches_{self.max_matches}max_{self.metric}_list_{list_hash}.csv"
        return os.path.join(self.output_directory, "matches", filename)


class MatchesTask(PipelineTask):
    """Convenience task to generate both csv-report and db-entries for detected matches."""

    needles_prefix: str = luigi.Parameter(default=".")
    haystack_prefix: str = luigi.Parameter(default=".")
    fingerprint_size: int = luigi.IntParameter(default=500)
    metric: str = luigi.Parameter(default="angular")
    n_trees: int = luigi.IntParameter(default=10)

    def requires(self):
        yield DBMatchesTask(
            config=self.config,
            needles_prefix=self.needles_prefix,
            haystack_prefix=self.haystack_prefix,
            fingerprint_size=self.fingerprint_size,
            metric=self.metric,
            n_trees=self.n_trees,
        )
        yield MatchesReportTask(
            config=self.config,
            needles_prefix=self.needles_prefix,
            haystack_prefix=self.haystack_prefix,
            fingerprint_size=self.fingerprint_size,
            metric=self.metric,
            n_trees=self.n_trees,
        )


class RemoteMatchesTarget(luigi.Target):
    """Represents remote matches results."""

    def __init__(
        self,
        haystack_prefix: str,
        repository_name: str,
        remote_signatures: RemoteSignaturesDAO,
        remote_matches: RemoteMatchesDAO,
        coll: FileCollection,
    ):
        self.haystack_prefix: str = haystack_prefix
        self.repository_name: str = repository_name
        self.remote_signatures: RemoteSignaturesDAO = remote_signatures
        self.remote_matches: RemoteMatchesDAO = remote_matches
        self.coll: FileCollection = coll

    def exists(self):
        last_result = self.remote_matches.latest_results(self.haystack_prefix, self.repository_name)
        # Must run if no previous results are available
        if last_result is None:
            return False
        # Must run if new remote signatures are available
        if last_result.max_remote_id < self.remote_signatures.last_remote_id(self.repository_name):
            return False
        # Must run if new local signatures are available
        return not self.coll.any(prefix=self.haystack_prefix, min_mtime=last_result.timestamp)


class RemoteMatchesTask(PipelineTask):
    """Find matches between local and remote files."""

    repository_name: str = luigi.Parameter()
    haystack_prefix: str = luigi.Parameter(default=".")

    fingerprint_size: int = luigi.IntParameter(default=500)
    metric: str = luigi.Parameter(default="angular")
    n_trees: int = luigi.IntParameter(default=10)

    def output(self):
        return RemoteMatchesTarget(
            haystack_prefix=self.haystack_prefix,
            repository_name=self.repository_name,
            remote_signatures=self.pipeline.remote_signature_dao,
            remote_matches=self.pipeline.remote_matches_dao,
            coll=self.pipeline.coll,
        )

    def requires(self):
        yield AnnoyIndexTask(
            config=self.config,
            prefix=self.haystack_prefix,
            fingerprint_size=self.fingerprint_size,
            metric=self.metric,
            n_trees=self.n_trees,
        )

    def run(self):
        annoy_input = self.input()

        self.logger.info("Loading NN-matcher for local files with prefix '%s'", self.haystack_prefix)
        neighbor_matcher = _load_nn(annoy_input, self.metric, self.progress.subtask(0.1))
        self.logger.info("Loaded NN-matcher with %s entries.", len(neighbor_matcher.haystack_keys))

        self.logger.info("Preparing remote signatures for matching")
        needles, sig_index = self._prepare_remote_signatures(self.progress.subtask(0.1))
        self.logger.info("Loaded %s remote signatures", len(needles))

        self.logger.info("Starting remote match detection")
        distance = self.config.proc.match_distance
        matching = self.progress.subtask(0.4)
        found_matches = neighbor_matcher.find_matches(needles=needles, max_distance=distance, progress=matching)
        self.logger.info("Found %s remote matches")

        self.logger.info("Preparing remote matches to save", len(found_matches))
        report = self._remote_matches(found_matches, sig_index, self.progress.subtask(0.1))
        self.logger.info("Prepared %s remote matches", len(report.matches))

        self.logger.info("Saving remote matches")
        self.pipeline.remote_matches_dao.save_matches(report, self.progress.remaining())
        self.logger.info("Successfully saved %s matches", len(report.matches))

    def _prepare_remote_signatures(
        self, progress: BaseProgressMonitor = ProgressMonitor.NULL
    ) -> Tuple[Sequence[FeatureVector], Dict[int, RemoteFingerprint]]:
        """Retrieve remote signatures and convert them to ``FeatureVector``s."""
        progress.scale(1.0)
        remote_signatures = list(self.pipeline.remote_signature_dao.query_signatures(self.repository_name))
        progress.increase(0.3)
        sig_index = {remote.id: remote for remote in remote_signatures}
        progress.increase(0.3)
        feature_vectors = []
        converting = progress.bar(scale=len(remote_signatures), unit="remote sigs")
        for remote in remote_signatures:
            feature_vectors.append(FeatureVector(key=remote.id, features=remote.fingerprint))
            converting.increase(1)
        converting.complete()
        return feature_vectors, sig_index

    def _remote_matches(
        self,
        detected_matches: Sequence[DetectedMatch],
        remote_sigs: Dict[int, RemoteFingerprint],
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> RemoteMatchesReport:
        """Convert detected feature-vector matches to remote matches."""
        remote_matches = []
        progress = progress.bar(scale=len(detected_matches), unit="matches")
        for detected_match in detected_matches:
            remote_match = RemoteMatch(
                remote=remote_sigs[detected_match.needle_key],
                local=detected_match.haystack_key,
                distance=detected_match.distance,
            )
            remote_matches.append(remote_match)
            progress.increase(1)
        progress.complete()
        return RemoteMatchesReport(
            haystack_prefix=self.haystack_prefix,
            repository_name=self.repository_name,
            timestamp=self.pipeline.coll.max_mtime(prefix=self.haystack_prefix),
            max_remote_id=self.pipeline.remote_signature_dao.last_remote_id(self.repository_name),
            matches=remote_matches,
        )


def _load_nn(
    annoy_input: FileGroupTarget, metric: str = "angular", progress: BaseProgressMonitor = ProgressMonitor.NULL
) -> NeighborMatcher:
    """Load the ``NeighborMatcher`` from the Annoy-index."""
    (annoy_path, keys_path), _ = annoy_input.latest_result
    return NeighborMatcher.load(annoy_path, keys_path, metric=metric, progress=progress)


def filter_dark(
    file_keys: Sequence[FileKey],
    matches: Sequence[DetectedMatch],
    pipeline: PipelineContext,
    progress: BaseProgressMonitor = ProgressMonitor.NULL,
    logger: logging.Logger = logging.getLogger(__name__),
) -> Tuple[Sequence[DetectedMatch], Dict[FileKey, Dict]]:
    """Filter dark videos."""
    logger.info("Estimating brightness for %s files", len(file_keys))
    brightness: Dict[FileKey, float] = {}
    video_features = pipeline.repr_storage.video_level
    calculating_brightness = progress.bar(0.7, scale=len(file_keys), unit="files")
    for file_key in file_keys:
        brightness[file_key] = get_brightness_estimation(video_features.read(file_key))
        calculating_brightness.increase(1)
    calculating_brightness.complete()
    logger.info("Brightness estimation is finished")

    logger.info("Preparing metadata for %s files")
    metadata: Dict[FileKey, Dict] = {}
    config = pipeline.config
    threshold = config.proc.filter_dark_videos_thr
    preparing_metadata = progress.bar(0.1, scale=len(brightness), unit="files")
    for file_key, gray_max in brightness.items():
        metadata[file_key] = _metadata(gray_max, threshold)
        preparing_metadata.increase(1)
    preparing_metadata.complete()
    logger.info("Preparing metadata is finished.")

    discarded = {key for key, meta in metadata.items() if meta["flagged"]}
    progress.increase(0.1)
    logger.info("%s files are marked as dark and will be discarded")

    logger.info("Discarding %s files from %s matches", len(discarded), len(matches))
    filtered_matches = list(_reject(matches, discarded))
    progress.increase(0.1)
    logger.info("%s matches remain after discarding dark files", len(filtered_matches))

    return filtered_matches, metadata


def _metadata(gray_max, threshold) -> Dict:
    """Create metadata dict."""
    video_dark_flag = gray_max < threshold
    return {"gray_max": gray_max, "video_dark_flag": video_dark_flag, "flagged": video_dark_flag}


def _reject(detected_matches: Sequence[DetectedMatch], discarded: Set[FileKey]) -> Iterator[DetectedMatch]:
    """Reject discarded matches."""
    for match in detected_matches:
        if match.needle_key not in discarded and match.haystack_key not in discarded:
            yield _order_match(match)


def _order_match(match: DetectedMatch):
    """Order match and query file keys"""
    if match.haystack_key.path <= match.needle_key.path:
        return replace(match, haystack_key=match.needle_key, needle_key=match.haystack_key)
    return match
