import os

import luigi
import pandas as pd
from cached_property import cached_property

from winnow.duplicate_detection.neighbors import NeighborMatcher, DetectedMatch
from winnow.pipeline.luigi.annoy_index import AnnoyIndexTask
from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprints
from winnow.pipeline.luigi.platform import PipelineTask, ConstTarget
from winnow.pipeline.luigi.utils import MatchesDF


class DBMatchesTask(PipelineTask):
    """Populate database with file matches."""

    prefix: str = luigi.Parameter(default=".")
    among_prefix: str = luigi.Parameter(default=".")
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
            prefix=self.among_prefix,
            fingerprint_size=self.fingerprint_size,
            metric=self.metric,
            n_trees=self.n_trees,
            clean_existing=self.clean_existing,
        )
        yield CondenseFingerprintsTask(
            config=self.config,
            prefix=self.prefix,
            fingerprint_size=self.fingerprint_size,
        )


class MatchesReportTask(PipelineTask):
    """Matches csv-report."""

    @cached_property
    def output_path(self) -> str:
        """Output file path."""
        match_distance = self.config.proc.match_distance
        return os.path.join(self.output_directory, f"matches_at_{match_distance:.2}_distance.csv")

    def run(self):
        self.logger.info("Reading condensed fingerprints")
        condensed: CondensedFingerprints = self.input().read()
        self.logger.info("Loaded %s fingerprints", len(condensed))

        self.logger.info("Preparing feature-vectors for matching")
        feature_vectors = condensed.to_feature_vectors(self.progress.subtask(0.3))
        self.logger.info("Prepared %s feature-vectors for matching", len(feature_vectors))

        self.logger.info("Building fingerprints index.")
        neighbor_matcher = NeighborMatcher(haystack=feature_vectors)
        self.logger.info("Searching for matches.")
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=self.config.proc.match_distance)
        self.logger.info("Found %s matches", len(matches))

        self.logger.info("Preparing file matches for saving")
        matches_df = MatchesDF.make(matches, self.progress.remaining())
        self.logger.info("Prepared %s file matches for saving", len(matches_df.index))

        self.logger.info("Saving matches report")
        self.save_matches_csv(matches_df)

    def output(self):
        return luigi.LocalTarget(self.output_path)

    def requires(self):
        return CondenseFingerprintsTask(config=self.config)

    def save_matches_csv(self, matches_df: pd.DataFrame):
        """Save matches to csv file."""
        with self.output().open("w") as output:
            matches_df.to_csv(output)
