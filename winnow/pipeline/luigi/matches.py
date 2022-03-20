import abc
import os
from datetime import datetime
from typing import Optional, Sequence

import luigi
import pandas as pd
from cached_property import cached_property

from winnow.duplicate_detection.neighbors import NeighborMatcher, DetectedMatch, FeatureVector
from winnow.pipeline.luigi.annoy_index import AnnoyIndexTask
from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprints
from winnow.pipeline.luigi.platform import PipelineTask, ConstTarget
from winnow.pipeline.luigi.targets import FileGroupTarget
from winnow.pipeline.luigi.utils import MatchesDF
from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor
from winnow.utils.files import PathTime


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
        progress.scale(1.0)
        (annoy_path, keys_path), _ = self.annoy_input.latest_result
        return NeighborMatcher.load(
            annoy_path,
            keys_path,
            metric=self.metric,
            progress=progress,
        )

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


class DBMatchesTask(PipelineTask):
    """Populate database with file matches."""

    needles_prefix: str = luigi.Parameter(default=".")
    haystack_prefix: str = luigi.Parameter(default=".")
    fingerprint_size: int = luigi.IntParameter(default=500)
    metric: str = luigi.Parameter(default="angular")
    n_trees: int = luigi.IntParameter(default=10)

    def run(self):
        annoy_input, condensed_input = self.input()
        self.logger.info("Reading condensed fingerprints")
        condensed: CondensedFingerprints = condensed_input.read(self.progress.subtask(0.1))
        self.logger.info("Loaded %s fingerprints", len(condensed))

        self.logger.info("Preparing feature-vectors for matching")
        feature_vectors = condensed.to_feature_vectors(self.progress.subtask(0.1))
        self.logger.info("Prepared %s feature-vectors for matching", len(feature_vectors))

        self.logger.info("Loading Nearest Neighbor matcher.")
        (annoy_path, keys_path), _ = annoy_input.latest_result
        neighbor_matcher = NeighborMatcher.load(
            annoy_path,
            keys_path,
            metric=self.metric,
            progress=self.progress.subtask(0.1),
        )
        self.logger.info("Loaded Nearest Neighbor matcher with %s entries.", len(neighbor_matcher.haystack_keys))

        self.logger.info("Searching for the matches.")
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=self.config.proc.match_distance)
        self.progress.increase(0.6)
        self.logger.info("Found %s matches", len(matches))

        def _entry(detected_match: DetectedMatch):
            """Flatten (query_key, match_key, dist) match entry."""
            query, match = detected_match.needle_key, detected_match.haystack_key
            return query.path, query.hash, match.path, match.hash, detected_match.distance

        self.logger.info("Saving %s matches to the database", len(matches))
        result_storage = self.pipeline.result_storage
        result_storage.add_matches(_entry(match) for match in matches)
        self.logger.info("Done!")

    def output(self):
        # Currently, we cannot know in advance if the task could be skipped
        # So we have to always execute this task.
        return ConstTarget(exists=not self.config.database.use)

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


class MatchesReportTask(PipelineTask):
    """Matches csv-report."""

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
        condensed: CondensedFingerprints = condensed_input.read(self.progress.subtask(0.1))
        self.logger.info("Loaded %s fingerprints", len(condensed))

        self.logger.info("Preparing feature-vectors for matching")
        feature_vectors = condensed.to_feature_vectors(self.progress.subtask(0.1))
        self.logger.info("Prepared %s feature-vectors for matching", len(feature_vectors))

        self.logger.info("Loading Nearest Neighbor matcher.")
        (annoy_path, keys_path), _ = annoy_input.latest_result
        neighbor_matcher = NeighborMatcher.load(
            annoy_path,
            keys_path,
            metric=self.metric,
            progress=self.progress.subtask(0.1),
        )
        self.logger.info("Loaded Nearest Neighbor matcher with %s entries.", len(neighbor_matcher.haystack_keys))

        self.logger.info("Searching for the matches.")
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=self.config.proc.match_distance)
        self.progress.increase(0.6)
        self.logger.info("Found %s matches", len(matches))

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
        with self.output().open("w") as output:
            matches_df.to_csv(output)

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
        default_output_path = os.path.join(self.output_directory, "matches", self.needles_prefix, default_filename)
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
