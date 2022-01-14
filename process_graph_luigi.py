import abc
import enum
import logging
import logging.config
import math
import os
import shutil
from glob import glob
from os import PathLike, fspath
from typing import Tuple, List, Dict

import click
import luigi
import luigi.format
import luigi.setup_logging
import matplotlib.axes
import matplotlib.cm
import matplotlib.figure
import matplotlib.pyplot as plt
import networkit as nk
import networkit.community
import numpy as np
import pandas as pd
from cached_property import cached_property
from dataclasses import asdict, astuple, dataclass
from typing.io import BinaryIO, TextIO

from winnow.config import Config
from winnow.duplicate_detection.neighbors import FeatureVector, NeighborMatcher, DetectedMatch
from winnow.pipeline.pipeline_context import PipelineContext
from winnow.pipeline.progress_monitor import ProgressBar, ProgressMonitor
from winnow.storage.file_key import FileKey
from winnow.utils.cli import create_pipeline


@dataclass
class Match:
    source: FileKey
    target: FileKey
    distance: float


class PipelineTask(luigi.Task):
    """Base class for pipeline tasks."""

    config_path = luigi.Parameter()

    @cached_property
    def pipeline(self) -> PipelineContext:
        """Get current pipeline."""
        return create_pipeline(self.config_path)

    @cached_property
    def config(self) -> Config:
        """Get resolved config."""
        return self.pipeline.config

    @cached_property
    def logger(self) -> logging.Logger:
        """Get current task logger."""
        cls = self.__class__
        return logging.getLogger(f"task.{cls.__qualname__}")

    @cached_property
    def output_directory(self) -> str:
        """Directory to store processing results."""
        return self.config.repr.directory


class CondensedFingerprintsTarget(luigi.Target):
    """
    Task target representing fingerprints written to a single npy file plus
    its legend (the corresponding file keys).

    Fingerprints are condensed to a single file for a faster reading.
    """

    def __init__(self, output_directory: str, name: str = "condensed_fingerprints"):
        self._output_directory: str = output_directory
        self._name: str = name

    @cached_property
    def directory(self) -> str:
        return self._output_directory

    @cached_property
    def fingerprints_file_path(self) -> str:
        return os.path.join(self._output_directory, f"{self._name}.npy")

    @cached_property
    def keys_file_path(self) -> str:
        return os.path.join(self._output_directory, f"{self._name}.files.csv")

    @cached_property
    def fingerprints_target(self) -> luigi.LocalTarget:
        return luigi.LocalTarget(self.fingerprints_file_path, format=luigi.format.Nop)

    @cached_property
    def keys_target(self) -> luigi.LocalTarget:
        return luigi.LocalTarget(self.keys_file_path)

    def exists(self) -> bool:
        return self.fingerprints_target.exists() and self.keys_target.exists()

    def write(self, fingerprints: np.ndarray, file_keys: pd.DataFrame):
        """Save condensed fingerprints."""
        with self.fingerprints_target.open("w") as fingerprints_out, self.keys_target.open("w") as keys_out:
            np.save(fingerprints_out, fingerprints)
            file_keys.to_csv(keys_out)

    def read(self) -> Tuple[np.ndarray, pd.DataFrame]:
        with self.fingerprints_target.open("r") as fingerprints_file, self.keys_target.open("r") as file_keys_file:
            fingerprints = np.load(fingerprints_file, allow_pickle=False)
            file_keys_df = pd.read_csv(file_keys_file)
            file_keys_df.fillna("", inplace=True)
        if len(fingerprints) != len(file_keys_df.index):
            raise Exception(
                "Inconsistent condensed vectors size: len(vectors) = %s != len(files) = %s",
                len(fingerprints),
                len(file_keys_df.index),
            )

    def read_fingerprints(self) -> np.ndarray:
        with self.fingerprints_target.open("r") as fingerprints_file:
            return np.load(fingerprints_file, allow_pickle=False)

    def read_file_keys_df(self) -> pd.DataFrame:
        with self.keys_target.open("r") as file_keys_file:
            file_keys_df = pd.read_csv(file_keys_file)
            file_keys_df.fillna("", inplace=True)
            return file_keys_df

    def read_file_keys(self) -> List[FileKey]:
        result = []
        file_keys_df = self.read_file_keys_df()
        for entry in file_keys_df.itertuples():
            result.append(FileKey(path=entry.path, hash=entry.hash))
        return result

    def read_as_feature_vectors(self, progress: ProgressMonitor = ProgressMonitor.NULL) -> List[FeatureVector]:
        """Convenience method to read fingerprints as FeatureVector's ready for matching."""
        fingerprints, file_keys_df = self.read()
        return make_feature_vectors(fingerprints, file_keys_df, progress)


class CondensedFingerprints(PipelineTask):
    """Create condensed fingerprints file."""

    fingerprint_size = luigi.IntParameter(default=500)

    def run(self):
        self.logger.info("Reading fingerprints")
        vectors, file_details = self.read_vectors()
        self.logger.info("Found %s fingerprints", len(vectors))

        vectors_file, legend_file = self.output()
        output_directory = self.pipeline.config.repr.directory
        self.logger.info("Writing condensed fingerprints to %s", output_directory)
        with vectors_file.open("w") as vectors_out, legend_file.open("w") as legend_out:
            np.save(vectors_out, vectors)
            file_details.to_csv(legend_out)

    def output(self):
        vectors_file = luigi.LocalTarget(
            os.path.join(self.output_directory, "condensed_fingerprints.npy"), format=luigi.format.Nop
        )
        vectors_legend = luigi.LocalTarget(os.path.join(self.output_directory, "condensed_fingerprints.files.csv"))
        return vectors_file, vectors_legend

    def read_vectors(self) -> Tuple[np.ndarray, pd.DataFrame]:
        """Read feature-vectors."""
        store = self.pipeline.repr_storage.signature
        self.logger.info("Discovering fingerprints")
        file_keys = list(store.list())
        self.logger.info("Found %s fingerprings", len(file_keys))

        portion, portion_size = 0, int(len(file_keys) ** 0.5)
        progress = ProgressBar(unit=" fingerprints")
        progress.scale(len(file_keys))
        vectors = []
        file_details = []

        expected_shape = (self.fingerprint_size,)
        for file_key in file_keys:
            try:
                fingerprint = store.read(file_key)
                if fingerprint.shape == expected_shape:
                    vectors.append(fingerprint)
                    file_details.append(astuple(file_key))
                else:
                    self.logger.error("Unexpected fingerprint shape %s of file %s", fingerprint.shape, file_key)
            except Exception:
                self.logger.exception("Error loading fingerprint from %s", asdict(file_key))
            portion += 1
            if portion >= portion_size:
                progress.increase(portion)
                portion = 0
        progress.complete()

        self.logger.info("Creating vectors ndarray")
        vectors = np.array(vectors)
        self.logger.info("Creating file details DataFrame")
        file_details = pd.DataFrame(file_details, columns=["path", "hash"])
        return vectors, file_details


class MatchesReport(PipelineTask):
    """Matches csv-report."""

    @cached_property
    def output_path(self) -> str:
        """Output file path."""
        match_distance = self.config.proc.match_distance
        return os.path.join(self.output_directory, f"matches_at_{match_distance:.2}_distance.csv")

    def run(self):
        self.logger.info("Reading condensed fingerprints")
        all_fingerprints = self.read_vectors()
        self.logger.info("Loaded %s fingerprints", len(all_fingerprints))

        self.logger.info("Building fingerprints index.")
        neighbor_matcher = NeighborMatcher(haystack=all_fingerprints)
        self.logger.info("Searching for matches.")
        matches = neighbor_matcher.find_matches(needles=all_fingerprints, max_distance=self.config.proc.match_distance)
        self.logger.info("Found %s matches", len(matches))

        self.logger.info("Saving matches report")
        self.save_matches_csv(matches)

    def output(self):
        return luigi.LocalTarget(self.output_path)

    def requires(self):
        return CondensedFingerprints(config_path=self.config_path)

    def read_vectors(self) -> List[FeatureVector]:
        vectors_npy, files_csv = self.input()

        with vectors_npy.open("r") as vectors_file, files_csv.open("r") as files_file:
            vectors = np.load(vectors_file, allow_pickle=False)
            files = pd.read_csv(files_file)
        if len(vectors) != len(files.index):
            raise Exception(
                "Inconsistent condensed vectors size: len(vectors) = %s != len(files) = %s",
                len(vectors),
                len(files.index),
            )

        self.logger.info("Preparing fingerprints for match detection")

        progress = ProgressBar(unit=" fingerprints")
        progress.scale(len(files.index))
        portion, portion_size = 0, int(len(files.index) ** 0.5)
        result = []
        for fingerprint, row in zip(vectors, files.itertuples()):
            result.append(FeatureVector(key=FileKey(path=row.path, hash=row.hash), features=fingerprint))
            portion += 1
            if portion >= portion_size:
                progress.increase(portion)
                portion = 0
        progress.complete()
        return result

    def save_matches_csv(self, matches: List[DetectedMatch]):
        """Save matches to csv file."""

        def entry(detected_match: DetectedMatch):
            """Flatten (query_key, match_key, dist) match entry."""
            source, target = detected_match.needle_key, detected_match.haystack_key
            return source.path, source.hash, target.path, target.hash, detected_match.distance

        self.logger.info("Creating report-dataframe")
        dataframe = pd.DataFrame(
            tuple(entry(match) for match in matches),
            columns=[
                "query_video",
                "query_sha256",
                "match_video",
                "match_sha256",
                "distance",
            ],
        )
        self.logger.info("Writing report-dataframe to %s", self.output_path)
        with self.output().open("w") as output:
            dataframe.to_csv(output)


class MatchGraph(PipelineTask):
    """Build match graph."""

    format = luigi.Parameter(default=nk.Format.METIS.name)

    def requires(self):
        return MatchesReport(config_path=self.config_path)

    def output(self):
        graph_file = luigi.LocalTarget(self.graph_path)
        nodes_file = luigi.LocalTarget(self.nodes_path)
        return graph_file, nodes_file

    def run(self):
        self.logger.info("Reading matches from report")
        report = pd.read_csv(self.input().open("r"))
        report.fillna("", inplace=True)
        self.logger.info("Loaded %s matches from csv-report", len(report.index))

        self.logger.info("Preparing matches for graph construction")
        matches = make_matches(report)
        self.logger.info("Prepared %s matches", len(matches))

        self.logger.info("Building graph")
        graph, id_to_file = self.build_graph(matches)
        self.logger.info("Builing graph is done.")

        self.logger.info("Writing graph")
        self.write_graph(graph, id_to_file)
        self.logger.info("Writing graph is done.")

    def build_graph(self, matches: List[Match]) -> Tuple[nk.Graph, Dict[int, FileKey]]:
        """Build graph from matches."""
        file_to_id = {}
        id_to_file = {}
        graph = nk.Graph(weighted=True)
        progress = ProgressBar(unit=" matches")
        progress.scale(total_work=len(matches))
        portion, portion_size = 0, int(len(matches) ** 0.5)

        def add_node(file_key: FileKey) -> int:
            """Add a single node."""
            file_id = file_to_id.get(file_key)
            if file_id is None:
                file_id = graph.addNode()
                file_to_id[file_key] = file_id
                id_to_file[file_id] = file_key
            return file_id

        max_distance = self.config.proc.match_distance
        for match in matches:
            source = add_node(match.source)
            target = add_node(match.target)
            graph.addEdge(source, target, max(1.0 - match.distance / max_distance, 0.0))
            portion += 1
            if portion >= portion_size:
                progress.increase(portion)
                portion = 0
        progress.complete()
        return graph, id_to_file

    def write_graph(self, graph: nk.Graph, id_to_file: Dict[int, FileKey]):
        """Write graph to file."""
        self.logger.info("Preparing node id->file DataFrame")
        path_hash_pairs = [None] * len(id_to_file)
        progress = ProgressBar(unit=" nodes")
        progress.scale(len(id_to_file))
        portion, portion_size = 0, int(len(id_to_file) ** 0.5)
        for node_id, file_key in id_to_file.items():
            path_hash_pairs[node_id] = astuple(file_key)
            portion += 1
            if portion >= portion_size:
                progress.increase(portion)
                portion = 0
        progress.complete()

        graph_target, nodes_target = self.output()
        with nodes_target.open("w") as nodes_file:
            self.logger.info("Saving nodes to %s", self.nodes_path)
            nodes = pd.DataFrame(path_hash_pairs, columns=["path", "hash"])
            nodes.to_csv(nodes_file)

        self.logger.info("Saving graph to %s, format=%s", self.graph_path, self.format)
        nk.graphio.writeGraph(graph, self.graph_path, nk.Format[self.format])

    @cached_property
    def graph_path(self) -> str:
        """Graph file path."""
        return os.path.join(self.output_directory, f"{self.result_name}.{self.format}")

    @cached_property
    def nodes_path(self) -> str:
        """Graph nodes list csv (node-id -> file-key mapping)."""
        return os.path.join(self.output_directory, f"{self.result_name}.nodes.csv")

    @cached_property
    def result_name(self):
        """Result file name."""
        match_distance = self.config.proc.match_distance
        return f"match_graph_at_{match_distance:.2}_distance"


class GraphCommunities(PipelineTask):
    """Find match graph communities for each file."""

    def run(self):
        graph_input, nodes_input = self.input()
        graph_path = graph_input.path
        graph_format_name = os.path.splitext(graph_path)[1][1:]

        self.logger.info("Loading graph from %s", graph_path)
        graph = nk.graphio.readGraph(graph_input.path, nk.Format[graph_format_name])
        self.logger.info("Loaded graph with %s nodes and %s edges", graph.numberOfNodes(), graph.numberOfEdges())

        self.logger.info("Detecting communities")
        partition = nk.community.detectCommunities(graph)
        modularity = nk.community.Modularity().getQuality(partition, graph)
        partition.compact()
        self.logger.info("Detected %s communities, modularity = %s", partition.numberOfSubsets(), modularity)

        self.logger.info("Loading file details for graph nodes")
        with nodes_input.open("r") as nodes_file:
            file_keys = pd.read_csv(nodes_file)
        file_keys.fillna("", inplace=True)
        self.logger.info("Loaded file details for %s nodes", len(file_keys.index))

        self.logger.info("Building file->community dataframe")
        entries = []
        for entry in file_keys.itertuples():
            node_id = entry.Index
            community_id = partition.subsetOf(node_id)
            entries.append((entry.path, entry.hash, community_id))
        communities_df = pd.DataFrame(entries, columns=["path", "hash", "community"])
        self.logger.info("Building file->community dataframe is done")

        self.logger.info("Saving communities to %s", self.output_path)
        communities_csv, communities_partition = self.output()
        with communities_csv.open("w") as communities_csv_file:
            communities_df.to_csv(communities_csv_file)
            nk.community.writeCommunities(partition, communities_partition.path)
        self.logger.info("Saving communities is done")

    def requires(self):
        return MatchGraph(config_path=self.config_path)

    def output(self):
        return luigi.LocalTarget(f"{self.output_path}.csv"), luigi.LocalTarget(f"{self.output_path}.partition")

    @cached_property
    def output_path(self) -> str:
        """Output file path."""
        match_distance = self.config.proc.match_distance
        return os.path.join(self.output_directory, f"communities_at_{match_distance:.2}_distance")


class EmbeddingsTask(PipelineTask, abc.ABC):
    """Abstract task to perform dimension reduction on fingerprints."""

    def run(self):
        self.logger.info("Loading fingerprints from cache")
        vectors = self.read_fingerprints()
        self.logger.info("Loaded %s fingerprints", len(vectors))

        self.logger.info(f"Reducing fingerprint dimensions using {self.alogrithm_name}")
        embeddings = self.fit_transform(vectors)
        self.logger.info(f"{self.alogrithm_name} dimension reduction is done")

        self.logger.info("Saving embeddings")
        self.save_embeddings(embeddings)
        self.logger.info("Saving embeddings done")

    def output(self):
        return luigi.LocalTarget(self.output_path, format=luigi.format.Nop)

    def requires(self):
        return CondensedFingerprints(config_path=self.config_path)

    def read_fingerprints(self) -> np.ndarray:
        """Read condensed fingerprints."""
        vectors_input, _ = self.input()
        with vectors_input.open("r") as vectors_file:
            return np.load(vectors_file)

    def save_embeddings(self, embeddings):
        """Save embeddings to the output target."""
        with self.output().open("w") as embeddings_file:
            np.save(embeddings_file, embeddings)

    @cached_property
    def output_path(self) -> str:
        """File path to save embeddings."""
        return os.path.join(self.output_directory, f"{self.alogrithm_name.lower()}_embeddings.npy")

    @property
    @abc.abstractmethod
    def alogrithm_name(self) -> str:
        """Dimension reduction algorithm name."""
        pass

    @abc.abstractmethod
    def fit_transform(self, vectors: np.ndarray) -> np.ndarray:
        """Perform dimension reduction."""
        pass


class EmbeddingsImageTask(PipelineTask, abc.ABC):
    """Abstract task to visualize all fingerprints with communities."""

    n_communities = luigi.IntParameter(default=20)
    alpha = luigi.FloatParameter(default=0.2)
    color_map = luigi.Parameter(default="Spectral")
    ignored_outliers_ratio = luigi.FloatParameter(default=0.001)
    figure_width = luigi.FloatParameter(default=20.0)
    figure_height = luigi.FloatParameter(default=20.0)
    point_size = luigi.IntParameter(default=1)

    def run(self):
        self.logger.info("Loading embeddings")
        embeddings = self.read_embeddings()
        self.logger.info("Loaded embeddings with shape %s", embeddings.shape)

        self.logger.info("Loading file keys for embeddings")
        vector_files = self.read_vector_files()
        self.logger.info("Loaded %s file keys", len(vector_files))

        self.logger.info("Loading graph partition")
        partition = self.read_partition()
        self.logger.info("Loaded %s partitions", partition.numberOfSubsets())

        self.logger.info("Calculating colors for top %s communities", self.n_communities)
        com_colors = self.community_colors(partition)
        self.logger.info("Calculating colors is done")

        self.logger.info("Loading file communities")
        file_coms = self.read_file_communities()
        self.logger.info("Loaded file communities for %s files", len(file_coms))

        self.logger.info("Preparing point colors")
        colors = self.prepare_colors(embeddings, vector_files, file_coms, com_colors, partition)
        self.logger.info("Prepared colors for %s fingerprints", len(colors))

        self.logger.info("Drawing %s image with %s colored communities", self.algorithm_name, self.n_communities)
        self.draw_figure(embeddings, colors)
        self.logger.info("Done drawing %s image", self.algorithm_name)

    def requires(self):
        yield CondensedFingerprints(config_path=self.config_path)
        yield GraphCommunities(config_path=self.config_path)
        yield self.embeddings_task

    def output(self):
        return luigi.LocalTarget(self.output_path)

    @cached_property
    def output_path(self) -> str:
        """Output image path."""
        match_distance = self.config.proc.match_distance
        algo = self.algorithm_name.lower()
        dist = f"dist{match_distance:.2}"
        coms = f"coms{self.n_communities}"
        size = f"size{self.figure_width:.4}x{self.figure_height:.4}"
        drop = f"drop{self.ignored_outliers_ratio:.2}"
        alpha = f"alpha{self.alpha:.2}"
        point = f"p{self.point_size}"

        return os.path.join(self.output_directory, f"{algo}_{dist}_{coms}_{size}_{drop}_{alpha}_{point}.png")

    def read_embeddings(self) -> np.ndarray:
        """Read saved trimap embeddings."""
        _, _, embeddings_input = self.input()
        with embeddings_input.open("r") as embeddings_file:
            return np.load(embeddings_file)

    def read_vector_files(self) -> List[FileKey]:
        """Read file key for each vector."""
        (_, files_csv), _, _ = self.input()
        self.logger.info("Reading condensed file key attributes from csv-file")
        with files_csv.open("r") as files_file:
            vector_files = pd.read_csv(files_file)
            vector_files.fillna("", inplace=True)

        self.logger.info("Preparing FileKeys")
        file_keys = []
        for entry in vector_files.itertuples():
            file_keys.append(FileKey(path=entry.path, hash=entry.hash))
        return file_keys

    def read_file_communities(self) -> Dict[FileKey, int]:
        """Read file-key->community mapping."""
        self.logger.info("Reading file communities from csv file")
        _, (file_coms_csv, _), _ = self.input()
        with file_coms_csv.open("r") as file_coms_file:
            file_coms = pd.read_csv(file_coms_file)
            file_coms.fillna("", inplace=True)
            file_coms["community"] = file_coms["community"].astype(int)

        self.logger.info("Preparing file-key -> community index")
        result = {}
        for entry in file_coms.itertuples():
            result[FileKey(path=entry.path, hash=entry.hash)] = entry.community
        return result

    def read_partition(self) -> nk.structures.Partition:
        """Read graph partition."""
        _, (_, partition_input), _ = self.input()
        return nk.community.readCommunities(partition_input.path)

    def community_colors(self, communities: nk.structures.Partition) -> Dict[int, int]:
        """Get color for each community."""
        size_id = [(size, com_id) for com_id, size in communities.subsetSizeMap().items()]
        size_id.sort(reverse=True)

        colors = {}
        for size, com_id in size_id[: self.n_communities]:
            colors[com_id] = len(colors)
        return colors

    def prepare_colors(
        self,
        embeddings: np.ndarray,
        vector_files: List[FileKey],
        file_coms: Dict[FileKey, int],
        com_colors: Dict[int, int],
        partition: nk.structures.Partition,
    ) -> np.ndarray:
        """Get list of colors for each vector."""
        colors = []
        no_community_id = partition.numberOfSubsets() + 1
        for file_key in vector_files[: len(embeddings)]:
            community_id = file_coms.get(file_key, no_community_id)
            color = com_colors.get(community_id, self.n_communities + 1)
            colors.append(color)
        return np.array(colors)

    def draw_figure(self, embeddings: np.ndarray, colors: np.ndarray):
        """Draw and save image displaying fingerprints."""
        figure = plt.figure()
        self.apply_image_config(figure, embeddings)
        figure.gca().scatter(
            embeddings[:, 0],
            embeddings[:, 1],
            c=colors,
            cmap=self.color_map,
            s=self.point_size,
            alpha=self.alpha,
        )
        figure.savefig(self.output().path, format="png")

    def apply_image_config(self, figure: matplotlib.figure.Figure, embeddings: np.ndarray):
        """Apply figure configuration."""
        # Set up general figure attributes
        axes = figure.gca()
        figure.set_figwidth(self.figure_width)
        figure.set_figheight(self.figure_height)
        figure.suptitle(self.figure_title, fontsize=24)
        # Set up colorbar
        colorbar_boundaries = np.arange(self.n_communities + 1) - 0.5
        mappable = matplotlib.cm.ScalarMappable(cmap=self.color_map)
        colorbar = figure.colorbar(mappable, boundaries=colorbar_boundaries)
        colorbar.set_ticks(np.arange(self.n_communities))
        # Configure current Axes
        axes.set_aspect("equal", "datalim")
        # Configure limits
        self.set_limits(embeddings, axes)

    def set_limits(self, embeddings: np.ndarray, axes: matplotlib.axes.Axes):
        """Calculate X and Y axis limit."""
        n_ignored_outliers = math.floor(len(embeddings) * self.ignored_outliers_ratio)
        if n_ignored_outliers == 0:
            return
        sorted_coordinates = np.sort(embeddings, kind="heapsort", axis=0)
        axes.set_ylim(sorted_coordinates[n_ignored_outliers][1], sorted_coordinates[-n_ignored_outliers][1])
        axes.set_xlim(sorted_coordinates[n_ignored_outliers][0], sorted_coordinates[-n_ignored_outliers][0])

    @cached_property
    def figure_title(self) -> str:
        """Get figure title"""
        return f"{self.algorithm_name} projection of the fingerprint dataset"

    @property
    @abc.abstractmethod
    def embeddings_task(self) -> EmbeddingsTask:
        """Get required embeddings task."""

    @property
    @abc.abstractmethod
    def algorithm_name(self) -> str:
        """Dimension reduction algorithm name."""


class TopComsImageTask(EmbeddingsImageTask):
    """Use embedding to display only top communities."""

    def draw_figure(self, embeddings: np.ndarray, colors: np.ndarray):
        top_communities = colors < self.n_communities
        super().draw_figure(embeddings[top_communities], colors[top_communities])

    @cached_property
    def output_path(self) -> str:
        match_distance = self.config.proc.match_distance
        algo = self.algorithm_name.lower()
        top = f"top{self.n_communities}"
        dist = f"dist{match_distance:.2}"
        size = f"size{self.figure_width:.4}x{self.figure_height:.4}"
        drop = f"drop{self.ignored_outliers_ratio:.2}"
        alpha = f"alpha{self.alpha:.2}"
        point = f"p{self.point_size}"

        return os.path.join(self.output_directory, f"{algo}_{top}_{dist}_{size}_{drop}_{alpha}_{point}.png")

    @cached_property
    def figure_title(self) -> str:
        """Get figure title"""
        return f"{self.algorithm_name} projection of top-{self.n_communities} communities of the fingerprint dataset"


class UmapEmbeddings(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using UMAP.

    See https://umap-learn.readthedocs.io/en/latest/
    """

    @property
    def alogrithm_name(self) -> str:
        return "UMAP"

    def fit_transform(self, vectors: np.ndarray) -> np.ndarray:
        import umap

        reducer = umap.UMAP(random_state=42, n_neighbors=100)
        reducer.fit(vectors)
        return reducer.transform(vectors)

    def read_fingerprints(self) -> np.ndarray:
        return super().read_fingerprints()[:100000]


class UmapImage(EmbeddingsImageTask):
    """Create UMAP dataset image with detected communities."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return UmapEmbeddings(config_path=self.config_path)

    @property
    def algorithm_name(self) -> str:
        return "UMAP"


class UmapTopComsImage(TopComsImageTask):
    """Draw only top communities using UMAP embeddings."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return UmapEmbeddings(config_path=self.config_path)

    @property
    def algorithm_name(self) -> str:
        return "UMAP"


class TriMapEmbeddings(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using TriMAP algorithm.

    See https://github.com/eamid/trimap
    """

    @property
    def alogrithm_name(self) -> str:
        return "TriMap"

    def fit_transform(self, vectors: np.ndarray) -> np.ndarray:
        import trimap

        return trimap.TRIMAP().fit_transform(vectors)


class TriMapImage(EmbeddingsImageTask):
    """Create TriMap dataset image with detected communities."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TriMapEmbeddings(config_path=self.config_path)

    @property
    def algorithm_name(self) -> str:
        return "TriMap"


class TriMapTopComsImage(TopComsImageTask):
    """Draw only top communities using TriMap embeddings."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TriMapEmbeddings(config_path=self.config_path)

    @property
    def algorithm_name(self) -> str:
        return "TriMap"


class PaCMAPEmbeddings(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using PaCMAP algorithm.

    See https://github.com/YingfanWang/PaCMAP
    """

    @property
    def alogrithm_name(self) -> str:
        return "PaCMAP"

    def fit_transform(self, vectors: np.ndarray) -> np.ndarray:
        import pacmap

        return pacmap.PaCMAP(n_dims=2, n_neighbors=100, MN_ratio=0.5, FP_ratio=2.0).fit_transform(vectors)


class PaCMAPImage(EmbeddingsImageTask):
    """Create PaCMAP dataset image with detected communities."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return PaCMAPEmbeddings(config_path=self.config_path)

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"


class PaCMAPTopComsImage(TopComsImageTask):
    """Draw only top communities using PaCMAP embeddings."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return PaCMAPEmbeddings(config_path=self.config_path)

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"


class TSNEEmbeddings(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using t-SNE algorithm.

    See https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html
    """

    def read_fingerprints(self) -> np.ndarray:
        return super().read_fingerprints()[:20000]

    @property
    def alogrithm_name(self) -> str:
        return "t-SNE"

    def fit_transform(self, vectors: np.ndarray) -> np.ndarray:
        from sklearn.manifold import TSNE

        return TSNE(method="barnes_hut").fit_transform(vectors)


class TSNEImage(EmbeddingsImageTask):
    """Create t-SNE dataset image with detected communities."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TSNEEmbeddings(config_path=self.config_path)

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"


class TSNETopComsImage(TopComsImageTask):
    """Draw only top communities using t-SNE embeddings."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TSNEEmbeddings(config_path=self.config_path)

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"


class LabeledEmbeddingsImageTask(PipelineTask, abc.ABC):
    """Draw embeddings with custom labels."""

    alpha = luigi.FloatParameter(default=0.2)
    color_map = luigi.Parameter(default="Spectral")
    ignored_outliers_ratio = luigi.FloatParameter(default=0.001)
    figure_width = luigi.FloatParameter(default=20.0)
    figure_height = luigi.FloatParameter(default=20.0)
    point_size = luigi.IntParameter(default=1)

    def run(self):
        self.logger.info("Loading embeddings")
        embeddings = self.read_embeddings()
        self.logger.info("Loaded embeddings with shape %s", embeddings.shape)

        self.logger.info("Loading file keys for embeddings")
        vector_files = self.read_files_keys()
        self.logger.info("Loaded %s file keys", len(vector_files))

        self.logger.info("Obtaining colors")
        colors, color_labels = self.get_colors(embeddings, vector_files)
        self.logger.info("Obtined %s colors", len(color_labels))

        self.logger.info("Drawing image with")
        self.draw_figure(embeddings, colors, color_labels)
        self.logger.info("Done drawing image")

    def output(self):
        return luigi.LocalTarget(self.output_path)

    def read_files_keys(self) -> List[FileKey]:
        """Read file key for each vector."""
        file_keys_dataframe = self.read_condensed_file_keys()

        self.logger.info("Preparing FileKeys")
        file_keys = []
        for entry in file_keys_dataframe.itertuples():
            file_keys.append(FileKey(path=entry.path, hash=entry.hash))
        return file_keys

    def read_condensed_file_keys(self) -> pd.DataFrame:
        self.logger.info("Reading condensed file key attributes from csv-file")
        with self.file_keys_csv.open("r") as file_keys_file:
            file_keys_dataframe = pd.read_csv(file_keys_file)
            file_keys_dataframe.fillna("", inplace=True)
        return file_keys_dataframe

    def draw_figure(self, embeddings: np.ndarray, colors: np.ndarray, color_labels: List[str]):
        """Draw and save image displaying fingerprints."""
        figure = plt.figure()
        self.apply_image_config(figure, embeddings, color_labels)
        figure.gca().scatter(
            embeddings[:, 0],
            embeddings[:, 1],
            c=colors,
            cmap=self.color_map,
            s=self.point_size,
            alpha=self.alpha,
        )
        figure.savefig(self.output().path, format="png")

    def apply_image_config(self, figure: matplotlib.figure.Figure, embeddings: np.ndarray, color_labels: List[str]):
        """Apply figure configuration."""
        # Set up general figure attributes
        axes = figure.gca()
        figure.set_figwidth(self.figure_width)
        figure.set_figheight(self.figure_height)
        figure.suptitle(self.figure_title, fontsize=24)
        # Set up colorbar
        colorbar_boundaries = np.arange(len(color_labels) + 1) - 0.5
        mappable = matplotlib.cm.ScalarMappable(cmap=self.color_map)
        colorbar = figure.colorbar(mappable, boundaries=colorbar_boundaries)
        colorbar.set_ticks(np.arange(len(color_labels)))
        colorbar.set_ticklabels(color_labels)
        # Configure current Axes
        axes.set_aspect("equal", "datalim")
        # Configure limits
        self.set_limits(embeddings, axes)

    def set_limits(self, embeddings: np.ndarray, axes: matplotlib.axes.Axes):
        """Calculate X and Y axis limit."""
        n_ignored_outliers = math.floor(len(embeddings) * self.ignored_outliers_ratio)
        if n_ignored_outliers == 0:
            return
        sorted_coordinates = np.sort(embeddings, kind="heapsort", axis=0)
        axes.set_ylim(sorted_coordinates[n_ignored_outliers][1], sorted_coordinates[-n_ignored_outliers][1])
        axes.set_xlim(sorted_coordinates[n_ignored_outliers][0], sorted_coordinates[-n_ignored_outliers][0])

    @abc.abstractmethod
    def read_embeddings(self) -> np.ndarray:
        """Read saved trimap embeddings."""

    @abc.abstractmethod
    def get_colors(self, embeddings: np.ndarray, file_keys: List[FileKey]) -> Tuple[List[int], List[str]]:
        """Get file colors and color labels."""

    @property
    @abc.abstractmethod
    def figure_title(self) -> str:
        """Get figure title"""

    @property
    @abc.abstractmethod
    def output_path(self) -> str:
        """Output image path."""

    @property
    @abc.abstractmethod
    def file_keys_csv(self) -> luigi.LocalTarget:
        """Get file-keys csv input."""


class CCWebImage(LabeledEmbeddingsImageTask):
    """Draw CCWeb embeddings with the corresponding category labels."""

    def requires(self):
        yield CondensedFingerprints(config_path=self.config_path)
        yield self.embeddings_task

    def read_embeddings(self) -> np.ndarray:
        _, embeddings_input = self.input()
        with embeddings_input.open("r") as embeddings_file:
            return np.load(embeddings_file)

    def get_colors(self, embeddings: np.ndarray, file_keys: List[FileKey]) -> Tuple[List[int], List[str]]:
        label_counts = {}
        file_labels = []
        self.logger.info("Retrieving ccweb labels")
        for file_key in file_keys:
            label, *_ = file_key.path.split("/", maxsplit=1)
            label_counts[label] = label_counts.get(label, 0) + 1
            file_labels.append(label)

        sorted_count_labels = sorted([(count, label) for label, count in label_counts.items()], reverse=True)

        label_colors = {}
        for _, label in sorted_count_labels:
            label_colors[label] = len(label_colors)

        file_colors = np.array([label_colors[label] for label in file_labels])
        color_labels = [label for _, label in sorted_count_labels]
        return file_colors, color_labels

    @property
    def figure_title(self) -> str:
        return f"{self.algorithm_name} projection of cc_web videos"

    @property
    def output_path(self) -> str:
        algo = self.algorithm_name.lower()
        size = f"size{self.figure_width:.4}x{self.figure_height:.4}"
        drop = f"drop{self.ignored_outliers_ratio:.2}"
        alpha = f"alpha{self.alpha:.2}"
        point = f"p{self.point_size}"

        return os.path.join(self.output_directory, f"{algo}_ccweb_{size}_{drop}_{alpha}_{point}.png")

    @property
    def file_keys_csv(self) -> luigi.LocalTarget:
        (_, file_keys_input), _ = self.input()
        return file_keys_input

    @property
    @abc.abstractmethod
    def algorithm_name(self) -> str:
        """Get embedding algorithm name."""

    @property
    @abc.abstractmethod
    def embeddings_task(self) -> EmbeddingsTask:
        """Get the corresponding embedding tas."""

    def draw_figure(self, embeddings: np.ndarray, colors: np.ndarray, color_labels: List[str]):
        n_categories = 20
        top_categories = colors < n_categories
        super().draw_figure(embeddings[top_categories], colors[top_categories], color_labels[:n_categories])


class CCWebUmapImage(CCWebImage):
    """Draw UMAP projection of CCWeb videos."""

    @property
    def algorithm_name(self) -> str:
        return "UMAP"

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return UmapEmbeddings(config_path=self.config_path)


class CCWebTriMapImage(CCWebImage):
    """Draw TriMap projection of CCWeb videos."""

    @property
    def algorithm_name(self) -> str:
        return "TriMap"

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TriMapEmbeddings(config_path=self.config_path)


class CCWebPaCMAPImage(CCWebImage):
    """Draw PaCMAP projection of CCWeb videos."""

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return PaCMAPEmbeddings(config_path=self.config_path)


class CCWebTSNEImage(CCWebImage):
    """Draw t-SNE projection of CCWeb videos."""

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TSNEEmbeddings(config_path=self.config_path)


class AllCCWebImages(PipelineTask):
    """Produce all CCWeb-specific images."""

    # The same params as for EmbeddingsImageTask:
    alpha = luigi.FloatParameter(default=0.2)
    color_map = luigi.Parameter(default="Spectral")
    ignored_outliers_ratio = luigi.FloatParameter(default=0.001)
    figure_width = luigi.FloatParameter(default=20.0)
    figure_height = luigi.FloatParameter(default=20.0)
    point_size = luigi.IntParameter(default=1)

    def requires(self):
        params = self.all_params_dict()
        yield CCWebTSNEImage(**params)
        yield CCWebPaCMAPImage(**params)
        yield CCWebUmapImage(**params)
        yield CCWebTriMapImage(**params)

    def all_params_dict(self) -> Dict:
        """Get all task params as dict."""
        return {name: getattr(self, name) for name in AllCCWebImages.get_param_names()}


class AllEmbeddings(PipelineTask):
    """Produce all embeddings."""

    def requires(self):
        yield UmapEmbeddings(config_path=self.config_path)
        yield TriMapEmbeddings(config_path=self.config_path)
        yield PaCMAPEmbeddings(config_path=self.config_path)
        yield TSNEEmbeddings(config_path=self.config_path)


class AllEmbeddingImages(PipelineTask):
    """Produce all embeddings."""

    # The same params as for EmbeddingsImageTask:
    n_communities = luigi.IntParameter(default=20)
    alpha = luigi.FloatParameter(default=0.2)
    color_map = luigi.Parameter(default="Spectral")
    ignored_outliers_ratio = luigi.FloatParameter(default=0.001)
    figure_width = luigi.FloatParameter(default=20.0)
    figure_height = luigi.FloatParameter(default=20.0)
    point_size = luigi.IntParameter(default=1)

    def requires(self):
        params = self.all_params_dict()
        yield UmapImage(**params)
        yield UmapTopComsImage(**params)
        yield TriMapImage(**params)
        yield TriMapTopComsImage(**params)
        yield PaCMAPImage(**params)
        yield PaCMAPTopComsImage(**params)
        yield TSNEImage(**params)
        yield TSNETopComsImage(**params)

    def all_params_dict(self) -> Dict:
        """Get all task params as dict."""
        return {name: getattr(self, name) for name in AllEmbeddingImages.get_param_names()}


def make_feature_vectors(
    fingerprints: np.ndarray,
    file_keys_df: pd.DataFrame,
    progress: ProgressMonitor = ProgressMonitor.NULL,
) -> List[FeatureVector]:
    """Convert array of fingerprints and the corresponding file keys into feature-vectors.

    This is required to prepare file matching.
    """
    progress.scale(len(file_keys_df.index))
    portion, portion_size = 0, int(len(file_keys_df.index) ** 0.5)
    result = []
    for fingerprint, row in zip(fingerprints, file_keys_df.itertuples()):
        result.append(FeatureVector(key=FileKey(path=row.path, hash=row.hash), features=fingerprint))
        portion += 1
        if portion >= portion_size:
            progress.increase(portion)
            portion = 0
    progress.complete()
    return result


def make_matches(report: pd.DataFrame) -> List[Match]:
    """Make matches from the matches report dataframe."""
    progress = ProgressBar(unit=" matches")
    progress.scale(total_work=len(report.index))
    result = []
    portion, portion_size = 0, int(len(report.index) ** 0.5)
    for row in report.itertuples():
        match = Match(
            source=FileKey(path=row.query_video, hash=row.query_sha256),
            target=FileKey(path=row.match_video, hash=row.match_sha256),
            distance=row.distance,
        )
        result.append(match)
        portion += 1
        if portion >= portion_size:
            progress.increase(portion)
            portion = 0
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


class CrossCollectionMatches(PipelineTask):
    other_config_path = luigi.Parameter()

    @cached_property
    def output_path(self) -> str:
        """Output file path."""
        match_distance = self.config.proc.match_distance
        return os.path.join(self.output_directory, f"cross_matches_at_{match_distance:.2}_distance.csv")

    def run(self):
        self.logger.info("Loading fingerprint collections")
        needles, haystack = self.read_fingerprint_collections()
        self.logger.info("Loaded %s needles and %s haystack items", len(needles), len(haystack))

        self.logger.info("Building fingerprints index.")
        neighbor_matcher = NeighborMatcher(haystack=haystack)
        self.logger.info("Searching for matches.")
        matches = neighbor_matcher.find_matches(needles=needles, max_distance=self.config.proc.match_distance)
        self.logger.info("Found %s matches", len(matches))

        self.logger.info("Saving matches report")
        self.save_matches_csv(matches)

    def output(self):
        return luigi.LocalTarget(self.output_path)

    def requires(self):
        yield CondensedFingerprints(config_path=self.config_path)
        yield CondensedFingerprints(config_path=self.other_config_path)

    def read_fingerprint_collections(self) -> Tuple[List[FeatureVector], List[FeatureVector]]:
        (fingerprints_npy, file_keys_csv), (other_fingerprints_npy, other_file_keys_csv) = self.input()

        self.logger.info("Loading needles")
        with fingerprints_npy.open("r") as vectors_file, file_keys_csv.open("r") as file_keys_file:
            needles = read_fingerprints(vectors_file, file_keys_file, self.logger)

        self.logger.info("Loading haystack")
        with other_fingerprints_npy.open("r") as vectors_file, other_file_keys_csv.open("r") as file_keys_file:
            hastack = read_fingerprints(vectors_file, file_keys_file, self.logger)

        return needles, hastack

    def save_matches_csv(self, matches: List[DetectedMatch]):
        """Save matches to csv file."""

        def entry(detected_match: DetectedMatch):
            """Flatten (query_key, match_key, dist) match entry."""
            source, target = detected_match.needle_key, detected_match.haystack_key
            return source.path, source.hash, target.path, target.hash, detected_match.distance

        self.logger.info("Creating report-dataframe")
        dataframe = pd.DataFrame(
            tuple(entry(match) for match in matches),
            columns=[
                "query_video",
                "query_sha256",
                "match_video",
                "match_sha256",
                "distance",
            ],
        )
        self.logger.info("Writing report-dataframe to %s", self.output_path)
        with self.output().open("w") as output:
            dataframe.to_csv(output)


class CrossCollectionEmbeddings(EmbeddingsTask, abc.ABC):
    """Abstract task to perform dimension reduction on multiple fingerprint collections."""

    other_config_path = luigi.Parameter()

    def requires(self):
        yield CondensedFingerprints(config_path=self.config_path)
        yield CondensedFingerprints(config_path=self.other_config_path)

    def read_fingerprints(self) -> np.ndarray:
        """Read condensed fingerprints."""
        (input_1, _), (input_2, _) = self.input()
        with input_1.open("r") as file_1, input_2.open("r") as file_2:
            return np.concatenate([np.load(file_1), np.load(file_2)])

    @cached_property
    def output_path(self) -> str:
        """File path to save cross-collection embeddings."""
        return os.path.join(self.output_directory, f"cross_{self.alogrithm_name.lower()}_embeddings.npy")


class CrossCollectionSubsetEmbeddings(CrossCollectionEmbeddings, abc.ABC):
    """Cross-collection embeddings of selected vector subset."""

    max_vectors = luigi.IntParameter(default=0)

    def output(self):
        files_index_path = f"{without_ext(self.output_path)}.files.csv"
        return luigi.LocalTarget(self.output_path, format=luigi.format.Nop), luigi.LocalTarget(files_index_path)

    def read_file_keys(self) -> pd.DataFrame:
        """Read dataframe with file keys of both collections."""
        self.logger.info("Loading file keys")
        (_, files_1_csv), (_, files_2_csv) = self.input()
        with files_1_csv.open("r") as files_1, files_2_csv.open("r") as files_2:
            file_keys = pd.concat([pd.read_csv(files_1), pd.read_csv(files_2)])
        self.logger.info("Loaded %s file keys", len(file_keys.index))
        return file_keys

    def select_count(self, total_count: int, max_count: int) -> int:
        """Get actual count of selected vectors."""
        if max_count <= 0:
            return total_count
        return min(max_count, total_count)

    def select_subset(self, vectors: np.ndarray) -> Tuple[np.ndarray, pd.DataFrame]:
        """Get selected vectors and their file_keys as pandas DataFrame."""
        file_keys = self.read_file_keys()

        if len(file_keys.index) != len(vectors):
            raise RuntimeError(f"Inconsistent file_keys and vectors lengths: {len(file_keys)} != {len(vectors)}")

        select_count = self.select_count(total_count=len(vectors), max_count=self.max_vectors)
        self.logger.info("Selecting %s random elements from %s fingerprints", select_count, len(vectors))
        selected_indices = random_mask(total_size=len(vectors), true_count=select_count)

        selected_vectors = vectors[selected_indices]
        selected_file_keys = file_keys.iloc[selected_indices]

        self.logger.info("Selected %s random fingerprints", len(selected_vectors))
        return selected_vectors, selected_file_keys

    def save_embeddings(self, embeddings: Tuple[np.ndarray, pd.DataFrame]):
        """Save embeddings to the output target."""
        vectors, file_keys = embeddings
        vectors_output, file_keys_output = self.output()
        with vectors_output.open("w") as vectors_file, file_keys_output.open("w") as file_keys_file:
            np.save(vectors_file, vectors)
            file_keys.to_csv(file_keys_file)


class CrossCollectionUmapEmbeddings(CrossCollectionSubsetEmbeddings):
    """Project 2 fingerprint collections using UMAP."""

    @property
    def alogrithm_name(self) -> str:
        return "UMAP"

    def fit_transform(self, vectors: np.ndarray) -> Tuple[np.ndarray, pd.DataFrame]:
        import umap

        vectors, file_keys = self.select_subset(vectors)
        reducer = umap.UMAP(random_state=42, n_neighbors=100)
        reducer.fit(vectors)
        return reducer.transform(vectors), file_keys


class CrossCollectionTSNEEmbeddings(CrossCollectionSubsetEmbeddings):
    """Project 2 fingerprint collections using t-SNE."""

    @property
    def alogrithm_name(self) -> str:
        return "t-SNE"

    def fit_transform(self, vectors: np.ndarray) -> Tuple[np.ndarray, pd.DataFrame]:
        from sklearn.manifold import TSNE

        vectors, file_keys = self.select_subset(vectors)
        return TSNE(method="barnes_hut").fit_transform(vectors), file_keys


class CrossCollectionPaCMAPEmbeddings(CrossCollectionEmbeddings):
    """Project 2 fingerprint collections using PaCMAP."""

    @property
    def alogrithm_name(self) -> str:
        return "PaCMAP"

    def fit_transform(self, vectors: np.ndarray) -> np.ndarray:
        import pacmap

        return pacmap.PaCMAP(n_dims=2, n_neighbors=100, MN_ratio=0.5, FP_ratio=2.0).fit_transform(vectors)


class CrossCollectionTriMapEmbeddings(CrossCollectionEmbeddings):
    """Project 2 fingerprint collections using TriMap."""

    @property
    def alogrithm_name(self) -> str:
        return "TriMap"

    def fit_transform(self, vectors: np.ndarray) -> np.ndarray:
        import trimap

        return trimap.TRIMAP().fit_transform(vectors)


class AllCrossCollectionEmbeddings(PipelineTask):
    """Produce all cross-collection embeddings."""

    # The same params as for CrossCollectionEmbeddings:
    other_config_path = luigi.Parameter()

    def requires(self):
        params = self.all_params_dict()
        yield CrossCollectionUmapEmbeddings(max_vectors=200000, **params)
        yield CrossCollectionTriMapEmbeddings(**params)
        yield CrossCollectionPaCMAPEmbeddings(**params)
        yield CrossCollectionTSNEEmbeddings(max_vectors=20000, **params)

    def all_params_dict(self) -> Dict:
        """Get all task params as dict."""
        return {name: getattr(self, name) for name in AllCrossCollectionEmbeddings.get_param_names()}


class CrossMatchCategory(enum.Enum):
    COLL_1 = 0
    COLL_1_MATCHED = 1
    COLL_2_MATCHED = 2
    COLL_2 = 3

    @classmethod
    def names(cls) -> List[str]:
        labels = [None] * len(cls)
        for category in cls:
            labels[category.value] = category.name
        return labels


class CrossCollectionEmbeddingsImage(LabeledEmbeddingsImageTask, abc.ABC):
    """Base task to draw multiple projected fingerprint collections."""

    other_config_path = luigi.Parameter()

    def requires(self):
        yield CondensedFingerprints(config_path=self.config_path)
        yield CondensedFingerprints(config_path=self.other_config_path)
        yield CrossCollectionMatches(config_path=self.config_path, other_config_path=self.other_config_path)
        yield self.embeddings_task

    def read_embeddings(self) -> np.ndarray:
        _, _, _, embeddings_input = self.input()
        with embeddings_input.open("r") as embeddings_file:
            return np.load(embeddings_file)

    def read_condensed_file_keys(self) -> pd.DataFrame:
        """Read dataframe with file keys of both collections."""
        self.logger.info("Loading condensed file keys from both collections")
        (_, files_1_csv), (_, files_2_csv), _, _ = self.input()
        with files_1_csv.open("r") as files_1, files_2_csv.open("r") as files_2:
            file_keys = pd.concat([pd.read_csv(files_1), pd.read_csv(files_2)])
            file_keys.fillna("", inplace=True)
        self.logger.info("Loaded %s file keys", len(file_keys.index))
        return file_keys

    def get_colors(self, embeddings: np.ndarray, file_keys: List[FileKey]) -> Tuple[List[int], List[str]]:
        first_coll_size = self.first_coll_size
        match_counts = self.get_match_counts()

        colors = []
        for index, file_key in enumerate(file_keys):
            coll_1 = index < first_coll_size
            matched = file_key in match_counts
            if coll_1 and not matched:
                colors.append(CrossMatchCategory.COLL_1.value)
            elif coll_1 and matched:
                colors.append(CrossMatchCategory.COLL_1_MATCHED.value)
            elif not coll_1 and not matched:
                colors.append(CrossMatchCategory.COLL_2.value)
            else:
                colors.append(CrossMatchCategory.COLL_2_MATCHED.value)

        return colors, CrossMatchCategory.names()

    @property
    def figure_title(self) -> str:
        return f"Cross-Collection {self.algorithm_name} Projection"

    @property
    def output_path(self) -> str:
        algo = self.algorithm_name.lower()
        size = f"size{self.figure_width:.4}x{self.figure_height:.4}"
        drop = f"drop{self.ignored_outliers_ratio:.2}"
        alpha = f"alpha{self.alpha:.2}"
        point = f"p{self.point_size}"

        return os.path.join(self.output_directory, f"cross_{algo}_{size}_{drop}_{alpha}_{point}.png")

    @cached_property
    def first_coll_size(self) -> int:
        """Size of the first collection."""
        (_, file_keys_csv), _, _, _ = self.input()
        with file_keys_csv.open("r") as file_keys_file:
            return len(pd.read_csv(file_keys_file).index)

    def get_match_counts(self) -> Dict[Tuple[str, str], int]:
        """Get cross-collection match counts for file-keys."""
        self.logger.info("Loading cross-collection matches")
        _, _, matches_csv, _ = self.input()
        with matches_csv.open("r") as matches_file:
            matches_df = pd.read_csv(matches_file)
            matches_df.fillna("", inplace=True)
        self.logger.info("Loaded %s matches", len(matches_df.index))

        self.logger.info("Calculating cross-collection matches count for each file key")
        counts = {}

        progress = ProgressBar(unit=" keys")
        progress.scale(len(matches_df.index))
        portion, portion_size = 0, int(len(matches_df.index) ** 0.5)
        for entry in matches_df.itertuples():
            source = FileKey(entry.query_video, entry.query_sha256)
            target = FileKey(entry.match_video, entry.match_sha256)
            counts[source] = counts.get(source, 0) + 1
            counts[target] = counts.get(target, 0) + 1
            portion += 1
            if portion >= portion_size:
                progress.increase(portion)
                portion = 0
        progress.complete()
        self.logger.info("Calculated cross-collection matches count for %s file keys", len(counts))
        return counts

    @property
    def file_keys_csv(self) -> luigi.LocalTarget:
        raise NotImplementedError()

    @property
    @abc.abstractmethod
    def embeddings_task(self) -> luigi.Task:
        """Embeddings that will be visualized."""

    @property
    @abc.abstractmethod
    def algorithm_name(self) -> str:
        """Get embedding algorithm name."""


class CrossCollectionPaCMAPImage(CrossCollectionEmbeddingsImage):
    @property
    def embeddings_task(self) -> luigi.Task:
        return CrossCollectionPaCMAPEmbeddings(config_path=self.config_path, other_config_path=self.other_config_path)

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"


class CrossCollectionTriMapImage(CrossCollectionEmbeddingsImage):
    @property
    def embeddings_task(self) -> luigi.Task:
        return CrossCollectionTriMapEmbeddings(config_path=self.config_path, other_config_path=self.other_config_path)

    @property
    def algorithm_name(self) -> str:
        return "TriMap"


class AllCrossCollectionEmbeddingsImages(PipelineTask):
    """Produce all cross-collection embeddings images."""

    # The same params as for CrossCollectionEmbeddingsImage:
    other_config_path = luigi.Parameter()
    alpha = luigi.FloatParameter(default=0.2)
    color_map = luigi.Parameter(default="Spectral")
    ignored_outliers_ratio = luigi.FloatParameter(default=0.001)
    figure_width = luigi.FloatParameter(default=20.0)
    figure_height = luigi.FloatParameter(default=20.0)
    point_size = luigi.IntParameter(default=1)

    def requires(self):
        params = self.all_params_dict()
        yield CrossCollectionTriMapImage(**params)
        yield CrossCollectionPaCMAPImage(**params)

    def all_params_dict(self) -> Dict:
        """Get all task params as dict."""
        return {name: getattr(self, name) for name in AllCrossCollectionEmbeddingsImages.get_param_names()}


# @click.command()
# @click.option("--config_path", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
# def main(config_path):
#     luigi.build(
#         [
#             # CrossCollectionTSNEEmbeddings(
#             #     config_path="/home/stepan/work/benetech/repos/VideoDeduplication/config.big.yaml",
#             #     other_config_path="/home/stepan/work/benetech/repos/VideoDeduplication/config.big2.yaml",
#             #     max_vectors=20000,
#             # )
#             AllCrossCollectionEmbeddingsImages(
#                 config_path="/home/stepan/work/benetech/repos/VideoDeduplication/config.big.yaml",
#                 other_config_path="/home/stepan/work/benetech/repos/VideoDeduplication/config.big2.yaml",
#                 point_size=1,
#                 alpha=0.1,
#                 figure_width=10.0,
#                 figure_height=10.0,
#             ),
#         ],
#         local_scheduler=True,
#         workers=1,
#         logging_conf_file="./logging.conf",
#     )


@click.command()
@click.option("--config_path", "-cp", help="path to the project config file", default=os.environ.get("WINNOW_CONFIG"))
def main(config_path):
    luigi.build(
        [CondensedFingerprints(config_path=config_path)],
        local_scheduler=True,
        workers=1,
        logging_conf_file="./logging.conf",
    )


if __name__ == "__main__":
    main()
