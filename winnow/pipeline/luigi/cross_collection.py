import os

import luigi
import luigi.format
import luigi.setup_logging
import networkit as nk
import networkit.community
import pandas as pd
from cached_property import cached_property
from luigi.util import inherits

from winnow.duplicate_detection.neighbors import NeighborMatcher
from winnow.pipeline.luigi.communities import LocalMatchGraphCommunitiesTarget, MatchGraphCommunities
from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprints
from winnow.pipeline.luigi.match_graph import MatchGraphBuilder
from winnow.pipeline.luigi.matches import MatchesReportTask
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.utils import prefix, MatchesDF
from winnow.pipeline.progress_monitor import ProgressBar, ProgressMonitor, BaseProgressMonitor


class CrossCollectionMatches(PipelineTask):
    other_config_path: str = luigi.Parameter()
    other_collection_name: str = luigi.Parameter(default="cross")

    @cached_property
    def output_path(self) -> str:
        """Output file path."""
        match_distance = self.config.proc.match_distance
        name = self.other_collection_name
        return os.path.join(self.output_directory, f"{prefix(name)}matches_at_{match_distance:.2}_distance.csv")

    def run(self):
        self.logger.info("Reading condensed fingerprints")
        this_coll, other_coll = self.input()
        this_condensed: CondensedFingerprints = this_coll.read()
        other_condensed: CondensedFingerprints = other_coll.read()
        self.logger.info("Loaded %s fingerprints from this collection", len(this_condensed))
        self.logger.info("Loaded %s fingerprints from other collection", len(other_condensed))
        self.progress.increase(0.05)

        self.logger.info("Preparing this collection feature-vectors for matching")
        this_collection_feature_vectors = this_condensed.to_feature_vectors(self.progress.subtask(0.1))
        self.logger.info("Prepared %s feature-vectors for matching", len(this_collection_feature_vectors))

        self.logger.info("Preparing other collection feature-vectors for matching")
        other_collection_feature_vectors = other_condensed.to_feature_vectors(self.progress.subtask(0.1))
        self.logger.info("Prepared %s feature-vectors for matching", len(other_collection_feature_vectors))

        self.logger.info("Building fingerprints index.")
        neighbor_matcher = NeighborMatcher(haystack=other_collection_feature_vectors)
        self.logger.info("Searching for matches.")
        matches = neighbor_matcher.find_matches(
            needles=this_collection_feature_vectors,
            max_distance=self.config.proc.match_distance,
        )
        self.logger.info("Found %s matches", len(matches))
        self.progress.increase(0.6)

        self.logger.info("Preparing file matches for saving")
        matches_df = MatchesDF.make(matches, self.progress.subtask(0.1))
        self.logger.info("Prepared %s file matches for saving", len(matches_df.index))

        self.logger.info("Saving matches report")
        self.save_matches_csv(matches_df)

    def output(self):
        return luigi.LocalTarget(self.output_path)

    def requires(self):
        yield CondenseFingerprintsTask(config=self.config)
        yield CondenseFingerprintsTask(config=self.other_config)

    def save_matches_csv(self, matches_df: pd.DataFrame):
        """Save matches to csv file."""
        with self.output().open("w") as output:
            matches_df.to_csv(output)


@inherits(CrossCollectionMatches)
class CrossCollectionCommunities(PipelineTask):
    """Calculate communities for merged collections."""

    def run(self):
        cross_matches_input, this_matches_input, other_matches_input = self.input()

        # Initialize match graph builder
        max_distance = self.config.proc.match_distance
        builder = MatchGraphBuilder(weight=MatchGraphBuilder.normalized_proximity(max_distance))

        self.logger.info("Adding this collection matches")
        self.add_matches(builder, this_matches_input, self.progress.subtask(0.1))

        self.logger.info("Adding other collection matches")
        self.add_matches(builder, other_matches_input, self.progress.subtask(0.1))

        self.logger.info("Building partition for both collections separately")
        partition_separate = self.save_separate_communities(builder, self.progress.subtask(0.1))

        self.logger.info("Adding cross-collection matches")
        self.add_matches(builder, cross_matches_input, self.progress.subtask(0.1))

        self.logger.info("Building partition for merged graph")
        merged_communities = MatchGraphCommunities.detect(builder.build(), self.progress.subtask(0.1))
        self.logger.info("Detected %s communities in merged graph", len(merged_communities))

        self.logger.info("Saving merged communities")
        merged_target: LocalMatchGraphCommunitiesTarget = self.output()[1]
        merged_target.write(merged_communities, self.progress.subtask(0.1))

        self.logger.info("Calculating dissimilarity measures.")

        dis = nk.community.AdjustedRandMeasure().getDissimilarity(
            builder.graph, partition_separate, merged_communities.partition
        )
        self.logger.info("AdjustedRandMeasure dissimilarity is %s", dis)

        dis = nk.community.GraphStructuralRandMeasure().getDissimilarity(
            builder.graph, partition_separate, merged_communities.partition
        )
        self.logger.info("GraphStructuralRandMeasure dissimilarity is %s", dis)

        dis = nk.community.JaccardMeasure().getDissimilarity(
            builder.graph, partition_separate, merged_communities.partition
        )
        self.logger.info("JaccardMeasure dissimilarity is %s", dis)

        dis = nk.community.NMIDistance().getDissimilarity(
            builder.graph, partition_separate, merged_communities.partition
        )
        self.logger.info("NMIDistance dissimilarity is %s", dis)

        dis = nk.community.NodeStructuralRandMeasure().getDissimilarity(
            builder.graph, partition_separate, merged_communities.partition
        )
        self.logger.info("NodeStructuralRandMeasure dissimilarity is %s", dis)

    def output(self):
        match_distance = self.config.proc.match_distance
        name = self.other_collection_name
        return LocalMatchGraphCommunitiesTarget(
            output_directory=self.output_directory,
            name=f"separate_{prefix(name)}communities_at_{match_distance:.2}_distance",
        ), LocalMatchGraphCommunitiesTarget(
            output_directory=self.output_directory,
            name=f"merged_{prefix(name)}communities_at_{match_distance:.2}_distance",
        )

    def save_separate_communities(
        self,
        builder: MatchGraphBuilder,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> nk.Partition:
        """Calculate and save communities for each collection separately."""
        progress.scale(1.0)
        separate: LocalMatchGraphCommunitiesTarget = self.output()[0]
        communities = MatchGraphCommunities.detect(builder.build(), progress.subtask(0.5))
        separate.write(communities, progress.subtask(0.5))
        progress.complete()
        return communities.partition

    def requires(self):
        yield self.clone(CrossCollectionMatches)
        yield MatchesReportTask(config=self.config)
        yield MatchesReportTask(config=self.other_config)

    def add_matches(
        self,
        builder: MatchGraphBuilder,
        matches_input: luigi.LocalTarget,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ):
        """Add matches from csv-target to the graph."""
        progress.scale(1.0)
        with matches_input.open("r") as input_file:
            matches_df = MatchesDF.read_csv(input_file)
        progress.increase(0.1)
        self.logger.info("Loaded %s matches from CSV", len(matches_df.index))

        self.logger.info("Converting matches")
        matches = MatchesDF.to_matches(matches_df, ProgressBar(progress.subtask(0.5)))
        self.logger.info("Converted %s matches", len(matches))

        self.logger.info("Populating match graph")
        builder.add_matches(matches, ProgressBar(progress.remaining()))
