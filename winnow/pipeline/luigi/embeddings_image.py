import abc
import math
import os
from abc import ABC
from typing import Dict, List, Tuple

import luigi
import luigi.format
import luigi.setup_logging
import matplotlib.axes
import matplotlib.cm
import matplotlib.figure
import matplotlib.pyplot as plt
import networkit as nk
import numpy as np
from cached_property import cached_property

from winnow.pipeline.luigi.communities import (
    GraphCommunitiesTask,
    MatchGraphCommunities,
)
from winnow.pipeline.luigi.condense import CondensedFingerprints
from winnow.pipeline.luigi.embeddings import (
    EmbeddingsTask,
    UmapEmbeddingsTask,
    TriMapEmbeddingsTask,
    PaCMAPEmbeddingsTask,
    TSNEEmbeddingsTask,
)
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.progress_monitor import ProgressMonitor, BaseProgressMonitor


class EmbeddingsImageTask(PipelineTask, abc.ABC):
    """Abstract task to visualize all fingerprints with communities."""

    n_communities: int = luigi.IntParameter(default=20)
    alpha: float = luigi.FloatParameter(default=0.2)
    color_map: str = luigi.Parameter(default="Spectral")
    ignored_outliers_ratio: float = luigi.FloatParameter(default=0.001)
    figure_width: float = luigi.FloatParameter(default=20.0)
    figure_height: float = luigi.FloatParameter(default=20.0)
    point_size: int = luigi.IntParameter(default=1)

    def run(self):
        self.logger.info("Loading embeddings")
        condensed_embeddings = self.read_embeddings(self.progress.subtask(0.1))
        self.logger.info("Loaded embeddings with shape %s", condensed_embeddings.fingerprints.shape)

        self.logger.info("Loading match graph communities")
        communities = self.read_communities(self.progress.subtask(0.1))
        self.logger.info("Loaded %s communities", len(communities))

        self.logger.info("Calculating colors for top %s communities", self.n_communities)
        community_colors = self.community_colors(communities.partition)
        self.logger.info("Calculating colors is done")
        self.progress.increase(0.1)

        self.logger.info("Preparing point colors")
        colors = self.prepare_colors(condensed_embeddings, communities, community_colors)
        self.logger.info("Prepared colors for %s fingerprints", len(colors))
        self.progress.increase(0.2)

        self.logger.info("Drawing %s image with %s colored communities", self.algorithm_name, self.n_communities)
        self.draw_figure(condensed_embeddings.fingerprints, colors)
        self.logger.info("Done drawing %s image", self.algorithm_name)

    def output(self):
        return luigi.LocalTarget(self.output_path)

    def requires(self):
        yield GraphCommunitiesTask(config=self.config)
        yield self.embeddings_task

    def read_communities(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> MatchGraphCommunities:
        """Read saved match graph communities."""
        return self.input()[0].read(progress)

    def read_embeddings(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> CondensedFingerprints:
        """Read saved embeddings."""
        return self.input()[1].read(progress)

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

    def community_colors(self, communities: nk.structures.Partition) -> Dict[int, int]:
        """Get color for each community as community_id->color_id dict."""
        size_id = [(size, com_id) for com_id, size in communities.subsetSizeMap().items()]
        size_id.sort(reverse=True)

        colors = {}
        for size, community_id in size_id[: self.n_communities]:
            colors[community_id] = len(colors)
        return colors

    def prepare_colors(
        self,
        condensed_embeddings: CondensedFingerprints,
        communities: MatchGraphCommunities,
        community_colors: Dict[int, int],
    ) -> np.ndarray:
        """Get list of colors for each vector."""
        colors = []
        no_community_id = communities.partition.numberOfSubsets() + 1
        for file_key in condensed_embeddings.to_file_keys():
            community_id = communities.subsetId(file_key, default=no_community_id)
            color = community_colors.get(community_id, self.n_communities + 1)
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


class TopCommunitiesImageTask(EmbeddingsImageTask, ABC):
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
        return f"{self.algorithm_name} Projection of Top-{self.n_communities} Communities."


class LabeledEmbeddingsImageTask(PipelineTask, abc.ABC):
    """Draw embeddings with custom labels."""

    alpha: float = luigi.FloatParameter(default=0.2)
    color_map: str = luigi.Parameter(default="Spectral")
    ignored_outliers_ratio: float = luigi.FloatParameter(default=0.001)
    figure_width: float = luigi.FloatParameter(default=20.0)
    figure_height: float = luigi.FloatParameter(default=20.0)
    point_size: int = luigi.IntParameter(default=1)

    def run(self):
        self.logger.info("Loading embeddings")
        condensed_embeddings = self.read_embeddings()
        self.logger.info("Loaded embeddings with shape %s", condensed_embeddings.fingerprints.shape)
        self.progress.increase(0.1)

        self.logger.info("Obtaining colors")
        colors, color_labels = self.get_colors(condensed_embeddings)
        self.logger.info("Obtained %s colors", len(color_labels))
        self.progress.increase(0.2)

        self.logger.info("Drawing image with")
        self.draw_figure(condensed_embeddings.fingerprints, colors, color_labels)
        self.logger.info("Done drawing image")

    def output(self):
        return luigi.LocalTarget(self.output_path)

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
    def read_embeddings(self) -> CondensedFingerprints:
        """Read saved trimap embeddings."""

    @abc.abstractmethod
    def get_colors(self, condensed_embeddings: CondensedFingerprints) -> Tuple[List[int], List[str]]:
        """Get file colors and color labels."""

    @property
    @abc.abstractmethod
    def figure_title(self) -> str:
        """Get figure title"""

    @property
    @abc.abstractmethod
    def output_path(self) -> str:
        """Output image path."""


class UmapImageTask(EmbeddingsImageTask):
    """Create UMAP dataset image with detected communities."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return UmapEmbeddingsTask(config=self.config)

    @property
    def algorithm_name(self) -> str:
        return "UMAP"


class UmapTopCommunitiesImageTask(TopCommunitiesImageTask):
    """Draw only top communities using UMAP embeddings."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return UmapEmbeddingsTask(config=self.config)

    @property
    def algorithm_name(self) -> str:
        return "UMAP"


class TriMapImageTask(EmbeddingsImageTask):
    """Create TriMap dataset image with detected communities."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TriMapEmbeddingsTask(config=self.config)

    @property
    def algorithm_name(self) -> str:
        return "TriMap"


class TriMapTopCommunitiesImageTask(TopCommunitiesImageTask):
    """Draw only top communities using TriMap embeddings."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TriMapEmbeddingsTask(config=self.config)

    @property
    def algorithm_name(self) -> str:
        return "TriMap"


class PaCMAPImageTask(EmbeddingsImageTask):
    """Create PaCMAP dataset image with detected communities."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return PaCMAPEmbeddingsTask(config=self.config)

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"


class PaCMAPTopCommunitiesImageTask(TopCommunitiesImageTask):
    """Draw only top communities using PaCMAP embeddings."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return PaCMAPEmbeddingsTask(config=self.config)

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"


class TSNEImageTask(EmbeddingsImageTask):
    """Create t-SNE dataset image with detected communities."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TSNEEmbeddingsTask(config=self.config)

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"


class TSNETopCommunitiesImageTask(TopCommunitiesImageTask):
    """Draw only top communities using t-SNE embeddings."""

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TSNEEmbeddingsTask(config=self.config)

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"


class AllEmbeddingsImagesTasks(PipelineTask):
    """Draw all embeddings images."""

    # The same params as for EmbeddingsImageTask:
    n_communities: int = luigi.IntParameter(default=20)
    alpha: float = luigi.FloatParameter(default=0.2)
    color_map: str = luigi.Parameter(default="Spectral")
    ignored_outliers_ratio: float = luigi.FloatParameter(default=0.001)
    figure_width: float = luigi.FloatParameter(default=20.0)
    figure_height: float = luigi.FloatParameter(default=20.0)
    point_size: int = luigi.IntParameter(default=1)

    def requires(self):
        params = self.all_params_dict()
        yield UmapImageTask(**params)
        yield UmapTopCommunitiesImageTask(**params)
        yield TriMapImageTask(**params)
        yield TriMapTopCommunitiesImageTask(**params)
        yield PaCMAPImageTask(**params)
        yield PaCMAPTopCommunitiesImageTask(**params)
        yield TSNEImageTask(**params)
        yield TSNETopCommunitiesImageTask(**params)

    def all_params_dict(self) -> Dict:
        """Get all task params as dict."""
        return {name: getattr(self, name) for name in AllEmbeddingsImagesTasks.get_param_names()}
