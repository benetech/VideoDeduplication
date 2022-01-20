import logging
import os
from typing import Dict, List, Callable

import luigi
import networkit as nk
import pandas as pd
from cached_property import cached_property
from dataclasses import dataclass

from winnow.pipeline.luigi.matches import MatchesReportTask
from winnow.pipeline.luigi.platform import PipelineTask, Match
from winnow.pipeline.luigi.utils import MatchesDF, FileKeyDF
from winnow.pipeline.progress_monitor import ProgressMonitor, ProgressBar, LazyProgress
from winnow.storage.file_key import FileKey

# Type hint for function calculating graph edge weight from match distance
WeightFunc = Callable[[float], float]


@dataclass
class MatchGraph:
    """
    MatchGraph is a networkit graph with associated file-keys.
    """

    graph: nk.Graph
    file_keys: Dict[int, FileKey]  # node_id -> FileKey

    def to_file_keys_df(self, progress: ProgressMonitor = ProgressMonitor.NULL) -> pd.DataFrame:
        """Get DataFrame containing all the file-keys in the correct order."""
        return FileKeyDF.from_index_to_key_dict(self.file_keys, progress)

    @staticmethod
    def from_matches(matches: List[Match], weight: WeightFunc, progress: ProgressMonitor = ProgressMonitor.NULL):
        """Create MatchGraph from matches DataFrame."""
        file_to_id = {}
        id_to_file = {}
        graph = nk.Graph(weighted=True)
        progress = LazyProgress(progress.scale(len(matches)))

        def add_node(file_key: FileKey) -> int:
            """Add a single node."""
            file_id = file_to_id.get(file_key)
            if file_id is None:
                file_id = graph.addNode()
                file_to_id[file_key] = file_id
                id_to_file[file_id] = file_key
            return file_id

        for match in matches:
            source = add_node(match.source)
            target = add_node(match.target)
            graph.addEdge(source, target, weight(match.distance))
            progress.increase(1)
        progress.complete()
        return MatchGraph(graph=graph, file_keys=id_to_file)

    @staticmethod
    def normalized_proximity(max_distance: float) -> WeightFunc:
        """
        Edge weight strategy which calculates weight as a normalized proximit.

        Normalized proximity is 0.0 when distance=max_distance, and 1.0 when distance=0.0
        """

        def get_weight(distance: float) -> float:
            """Calculate normalized proximity from distance."""
            return max(1.0 - distance / max_distance, 0.0)

        return get_weight


class MatchGraphTarget(luigi.Target):
    """Task target representing match graph saved on a disc."""

    def __init__(self, output_directory: str, name: str, format: nk.Format = nk.Format.METIS):
        self._output_directory: str = output_directory
        self._name = name
        self._format = format

    @property
    def directory(self) -> str:
        return self._output_directory

    @property
    def name(self) -> str:
        return self._name

    @property
    def format(self) -> nk.Format:
        return self._format

    @cached_property
    def graph_file_path(self) -> str:
        return os.path.join(self.directory, f"{self.name}.{self.format.name}")

    @cached_property
    def file_keys_path(self) -> str:
        return os.path.join(self.directory, f"{self.name}.nodes.csv")

    @cached_property
    def graph_target(self) -> luigi.LocalTarget:
        return luigi.LocalTarget(self.graph_file_path)

    @cached_property
    def file_keys_target(self) -> luigi.LocalTarget:
        return luigi.LocalTarget(self.file_keys_path)

    def exists(self):
        return self.graph_target.exists() and self.file_keys_target.exists()

    def write(
        self,
        matches: MatchGraph,
        progress: ProgressMonitor = ProgressMonitor.NULL,
        logger: logging.Logger = None,
    ):
        """Write graph to local disc storage."""
        logger = logger or logging.getLogger(__name__)
        logger.info("Preparing  node_id->FileKey DataFrame")
        file_keys_df = matches.to_file_keys_df(progress)

        with self.file_keys_target.open("w") as nodes_file:
            logger.info("Saving node_id->FileKey DataFrame to %s", self.file_keys_path)
            file_keys_df.to_csv(nodes_file)

            logger.info("Saving graph to %s, format=%s", self.graph_file_path, self.format.name)
            nk.graphio.writeGraph(matches.graph, self.graph_file_path, self.format)
        progress.complete()

    def read(self, progress: ProgressMonitor = ProgressMonitor.NULL) -> MatchGraph:
        """Read match graph from local disc storage."""
        if not self.exists():
            raise Exception(f"Local MatchGraph not found: directory={self.directory}, name={self.name}")

        progress.scale(1.0)
        with self.file_keys_target.open("r") as file_keys_file:
            graph = nk.graphio.readGraph(self.graph_file_path, self.format)
            progress.increase(0.1)
            file_keys_df = pd.read_csv(file_keys_file)
            progress.increase(0.1)
            file_keys_dict = FileKeyDF.make_index_to_key_dict(file_keys_df, progress.remaining())
            progress.complete()
            return MatchGraph(graph=graph, file_keys=file_keys_dict)


class MatchGraphTask(PipelineTask):
    """Build match graph."""

    format = luigi.Parameter(default=nk.Format.METIS.name)

    def requires(self):
        return MatchesReportTask(config_path=self.config_path)

    def output(self) -> MatchGraphTarget:
        return MatchGraphTarget(
            output_directory=self.output_directory,
            name=self.result_name,
            format=nk.Format[self.format],
        )

    def run(self):
        self.logger.info("Reading matches from csv-report")
        with self.input().open("r") as matches_csv:
            matches_df = MatchesDF.read_csv(matches_csv)
        self.logger.info("Loaded %s matches from csv-report", len(matches_df.index))

        self.logger.info("Preparing matches for graph construction")
        matches = MatchesDF.to_matches(matches_df, ProgressBar(unit="matches"))
        self.logger.info("Prepared %s matches", len(matches))

        self.logger.info("Building graph")
        max_distance = self.pipeline.config.processing.match_distance
        result = MatchGraph.from_matches(
            matches=matches,
            weight=MatchGraph.normalized_proximity(max_distance),
            progress=ProgressBar(unit="matches"),
        )
        self.logger.info("Builing graph is done.")

        target = self.output()
        self.logger.info("Writing graph to %s", target.graph_file_path)
        target.write(result, ProgressBar(unit="nodes"))
        self.logger.info("Writing graph is done.")

    @cached_property
    def result_name(self):
        """Result file name."""
        match_distance = self.config.proc.match_distance
        return f"match_graph_at_{match_distance:.2}_distance"
