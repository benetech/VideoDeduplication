import os
from pathlib import Path
from typing import Dict, Union, AnyStr

import luigi
import networkit as nk
import networkit.community
import pandas as pd
from cached_property import cached_property
from dataclasses import dataclass
from typing.io import IO

from winnow.pipeline.luigi.match_graph import MatchGraphTask, MatchGraphTarget, MatchGraph
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.utils import FileKeyDF
from winnow.pipeline.progress_monitor import ProgressMonitor, LazyProgress, BaseProgressMonitor
from winnow.storage.file_key import FileKey


class CommunitiesDF:
    """Collection of utilities to work with communities DataFrame."""

    columns = ("path", "hash", "community")

    @staticmethod
    def read_csv(file: Union[str, Path, IO[AnyStr]], **kwargs) -> pd.DataFrame:
        """Read matches DataFrame from csv file."""
        matches_df = pd.read_csv(file, index_col=0, **kwargs)
        matches_df.fillna("", inplace=True)
        return matches_df

    @staticmethod
    def make(
        partition: nk.Partition,
        node_to_file_key: Dict[int, FileKey],
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> pd.DataFrame:
        """Create from partition."""
        communities_df = FileKeyDF.from_index_to_key_dict(node_to_file_key, progress.scale(1.0).subtask(0.5))
        communities_df.index.name = "node_id"

        progress = LazyProgress(progress.remaining().scale(len(communities_df.index), unit="nodes"))
        communities = [None] * len(communities_df.index)
        for node_id in communities_df.index:
            communities[node_id] = partition.subsetOf(node_id)
            progress.increase(1)

        communities_df["community"] = pd.Series(communities)
        progress.complete()
        return communities_df


@dataclass
class MatchGraphCommunities:
    """Data structure representing detected match graph communities."""

    partition: nk.Partition
    df: pd.DataFrame

    def subsetId(self, file_key: FileKey, default=None) -> int:
        """Get subset id by FileKey."""
        return self.partition.subsetOf(self.file_key_to_node.get(file_key, default))

    def subsetSize(self, file_key: FileKey) -> int:
        """Get subset size by FileKey."""
        return self.partition.subsetSizeMap().get(self.subsetId(file_key))

    @staticmethod
    def detect(match: MatchGraph, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Detect communities in match graph."""
        progress.scale(1.0)
        partition: nk.Partition = nk.community.detectCommunities(match.graph)
        partition.compact()
        progress.increase(0.5)

        communities_df = CommunitiesDF.make(partition, match.file_keys, progress.remaining())
        coms = MatchGraphCommunities(partition=partition, df=communities_df)
        progress.complete()
        return coms

    def modularity(self, graph: nk.Graph) -> float:
        """Calculate quality of the partitioning."""
        return nk.community.Modularity().getQuality(self.partition, graph)

    @cached_property
    def file_key_to_node(self) -> Dict[FileKey, int]:
        """Get FileKey->node_id dict."""
        return FileKeyDF.make_key_to_index_dict(self.df)

    def __len__(self) -> int:
        """Get number of communities."""
        return self.partition.numberOfSubsets()


class LocalMatchGraphCommunitiesTarget(luigi.Target):
    """
    Target representing MatchGraphCommunities saved on a disc.
    """

    def __init__(self, output_directory: str, name: str):
        self._output_directory: str = output_directory
        self._name = name

    @property
    def directory(self) -> str:
        return self._output_directory

    @property
    def name(self) -> str:
        return self._name

    @cached_property
    def partition_path(self) -> str:
        return os.path.join(self.directory, f"{self.name}.partition")

    @cached_property
    def file_keys_path(self) -> str:
        return os.path.join(self.directory, f"{self.name}.csv")

    @cached_property
    def partition_target(self) -> luigi.LocalTarget:
        return luigi.LocalTarget(self.partition_path)

    @cached_property
    def file_keys_target(self) -> luigi.LocalTarget:
        return luigi.LocalTarget(self.file_keys_path)

    def exists(self):
        return self.partition_target.exists() and self.file_keys_target.exists()

    def write(self, communities: MatchGraphCommunities, progress: BaseProgressMonitor = ProgressMonitor.NULL):
        """Write MatchGraphCommunities to the local file system."""
        progress.scale(1.0)

        with self.file_keys_target.open("w") as nodes_file:
            communities.df.to_csv(nodes_file)
            progress.increase(0.5)

            nk.community.writeCommunities(communities.partition, self.partition_path)
            progress.increase(0.5)
        progress.complete()

    def read(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> MatchGraphCommunities:
        """Read MatchGraphCommunities from the local file system."""
        if not self.exists():
            raise Exception(f"Local MatchGraphCommunities not found: directory={self.directory}, name={self.name}")

        progress.scale(1.0)
        with self.file_keys_target.open("r") as file_keys_csv:
            communities_df = CommunitiesDF.read_csv(file_keys_csv)
            progress.increase(0.5)

            partition = nk.community.readCommunities(self.partition_path)
            progress.increase(0.5)
        progress.complete()

        communities = MatchGraphCommunities(partition=partition, df=communities_df)
        return communities


class GraphCommunitiesTask(PipelineTask):
    """Find match graph communities for each file."""

    def run(self):
        graph_input: MatchGraphTarget = self.input()
        self.logger.info("Loading match graph from %s", graph_input.graph_file_path)
        matches = graph_input.read(progress=self.progress.subtask(0.2))
        self.logger.info("Loaded match graph with %s links", matches.graph.numberOfEdges())

        self.logger.info("Detecting communities")
        communities = MatchGraphCommunities.detect(matches, progress=self.progress.subtask(0.6))
        modularity = communities.modularity(matches.graph)
        self.logger.info(
            "Detected %s communities, modularity = %s", communities.partition.numberOfSubsets(), modularity
        )

        target = self.output()
        self.logger.info("Saving communities to %s", target.partition_path)
        target.write(communities, self.progress.remaining())
        self.logger.info("Saved communities successfully")

    def requires(self):
        return MatchGraphTask(config=self.config)

    def output(self):
        match_distance = self.config.proc.match_distance
        return LocalMatchGraphCommunitiesTarget(
            output_directory=self.output_directory,
            name=f"communities_at_{match_distance:.2}_distance",
        )
