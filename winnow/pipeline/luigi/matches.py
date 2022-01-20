import os

import luigi
import pandas as pd
from cached_property import cached_property

from winnow.duplicate_detection.neighbors import NeighborMatcher
from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprints
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.utils import MatchesDF
from winnow.pipeline.progress_monitor import ProgressBar


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
        feature_vectors = condensed.to_feature_vectors(ProgressBar(unit=" fingerprints"))
        self.logger.info("Prepared %s feature-vectors for matching", len(feature_vectors))

        self.logger.info("Building fingerprints index.")
        neighbor_matcher = NeighborMatcher(haystack=feature_vectors)
        self.logger.info("Searching for matches.")
        matches = neighbor_matcher.find_matches(needles=feature_vectors, max_distance=self.config.proc.match_distance)
        self.logger.info("Found %s matches", len(matches))

        self.logger.info("Preparing file matches for saving")
        matches_df = MatchesDF.make(matches, ProgressBar(unit=" matches"))
        self.logger.info("Prepared %s file matches for saving", len(matches_df.index))

        self.logger.info("Saving matches report")
        self.save_matches_csv(matches_df)

    def output(self):
        return luigi.LocalTarget(self.output_path)

    def requires(self):
        return CondenseFingerprintsTask(config_path=self.config_path)

    def save_matches_csv(self, matches_df: pd.DataFrame):
        """Save matches to csv file."""
        with self.output().open("w") as output:
            matches_df.to_csv(output)
