import abc
import json
import math
import os
import shutil
from typing import Union, Tuple, List

import luigi
import matplotlib.pyplot as plt
import numpy as np
from dataclasses import dataclass
from matplotlib.pyplot import Figure, Axes

from winnow.pipeline.luigi.condense import CondensedFingerprintsTarget
from winnow.pipeline.luigi.embeddings import (
    PaCMAPEmbeddingsTask,
    TSNEEmbeddingsTask,
    UmapEmbeddingsTask,
    TriMapEmbeddingsTask,
)
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.targets import FileWithTimestampTarget
from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor


@dataclass
class BBox:
    """A two-dimensional bounding box of the collection of points."""

    min_x: float
    max_x: float
    min_y: float
    max_y: float

    @property
    def y_lim(self) -> Tuple[float, float]:
        """Y-axis limits."""
        return self.min_y, self.max_y

    @property
    def x_lim(self) -> Tuple[float, float]:
        """X-axis limits."""
        return self.min_x, self.max_x

    @property
    def width(self) -> float:
        """Bounding box width."""
        return abs(self.max_x - self.min_x)

    @property
    def height(self) -> float:
        """Bounding box height."""
        return abs(self.max_y - self.min_y)

    @property
    def center(self) -> Tuple[float, float]:
        """Get the bonding box center."""
        center_x = (self.max_x + self.min_x) / 2.0
        center_y = (self.max_y + self.min_y) / 2.0
        return center_x, center_y

    def squared(self) -> "BBox":
        """Make Bounding Box equal-sided."""
        center_x, center_y = self.center
        delta = max(self.width, self.height) / 2.0
        return BBox.make(
            min_x=center_x - delta,
            max_x=center_x + delta,
            min_y=center_y - delta,
            max_y=center_y + delta,
        )

    def select(self, points: np.ndarray, rel_margin: float = 0.0) -> np.ndarray:
        """Select points from this bounding box."""
        margin_x = self.width * rel_margin
        margin_y = self.height * rel_margin
        selection_x = np.logical_and(
            points[:, 0] >= self.min_x - margin_x,
            points[:, 0] <= self.max_x + margin_x,
        )
        selection_y = np.logical_and(
            points[:, 1] >= self.min_y - margin_y,
            points[:, 1] <= self.max_y + margin_y,
        )
        selection = np.logical_and(selection_x, selection_y)
        return points[selection]

    def subbox(self, divide, x_index, y_index) -> "BBox":
        """Get sub-bounding box calculated by dividing current box `divide` times along x and y."""
        width = self.width / divide
        height = self.height / divide
        x_offset = self.min_x + width * x_index
        # y indexing is in the top-down direction
        y_offset = self.max_y - height * (y_index + 1)
        return BBox.make(
            min_x=x_offset,
            max_x=x_offset + width,
            min_y=y_offset,
            max_y=y_offset + height,
        )

    @staticmethod
    def make(
        min_x: float,
        max_x: float,
        min_y: float,
        max_y: float,
    ) -> "BBox":
        """Create BBox ensuring min/max ordering."""
        return BBox(
            min_x=min(min_x, max_x),
            max_x=max(min_x, max_x),
            min_y=min(min_y, max_y),
            max_y=max(min_y, max_y),
        )

    @staticmethod
    def calculate(
        pints: np.ndarray,
        rel_ignored_outliers: float = None,
    ) -> "BBox":
        """Calculate bounding box of the collection of 2D points."""
        sorted_coordinates = np.sort(pints, kind="heapsort", axis=0)
        if rel_ignored_outliers is None or not (0 <= rel_ignored_outliers <= 1.0):
            return BBox.make(
                min_x=sorted_coordinates[0][0],
                max_x=sorted_coordinates[-1][0],
                min_y=sorted_coordinates[0][1],
                max_y=sorted_coordinates[-1][1],
            )
        n_ignored = math.floor(len(pints) * rel_ignored_outliers)
        return BBox.make(
            min_x=sorted_coordinates[n_ignored][0],
            max_x=sorted_coordinates[-n_ignored - 1][0],
            min_y=sorted_coordinates[n_ignored][1],
            max_y=sorted_coordinates[-n_ignored - 1][1],
        )


@dataclass
class Tile:
    """A tile descriptor.

    The tile descriptor includes:
     * bbox - bounding box of the pints in the embedding space coordinates.
     * x, y - index of the tile along X and Y axes correspondingly for the given zoom level.
     * zoom - zoom level at which tile is supposed to be displayed.
    """

    bbox: BBox
    x: int = 0
    y: int = 0
    zoom: int = 0

    def subtiles(self) -> List["Tile"]:
        """Get the subtiles of the given tile (by increasing the zoom and splitting the tile 2x2)."""
        x_offset = self.x * 2
        y_offset = self.y * 2
        results: List[Tile] = []
        for x_index in (0, 1):
            for y_index in (0, 1):
                tile = Tile(
                    x=x_offset + x_index,
                    y=y_offset + y_index,
                    zoom=self.zoom + 1,
                    bbox=self.bbox.subbox(divide=2, x_index=x_index, y_index=y_index),
                )
                results.append(tile)
        return results

    @staticmethod
    def make_root(points: np.ndarray, rel_ignored_outliers: float = 0.0) -> "Tile":
        """Create a root tile for a collection of points."""
        bbox = BBox.calculate(points, rel_ignored_outliers).squared()
        return Tile(bbox=bbox, x=0, y=0, zoom=0)


class PointStyle(abc.ABC):
    """A point style strategy."""

    @abc.abstractmethod
    def size(self, zoom: int) -> Union[float, int]:
        """Get the point size for the given zoom."""

    @abc.abstractmethod
    def alpha(self, zoom: int) -> float:
        """Get the point opacity."""


class SimplePointStyle(PointStyle):
    """A point style strategy."""

    def __init__(
        self,
        min_zoom: int = 0,
        max_zoom: int = 10,
        max_size: int = 64,
        min_size: int = 1,
        min_alpha: float = 0.5,
    ):
        self.min_zoom: int = min_zoom
        self.max_zoom: int = max_zoom
        self.max_size: int = max_size
        self.min_size: int = min_size
        self.min_alpha: float = min_alpha

    def size(self, zoom: int) -> Union[float, int]:
        """Get the point size for the given zoom."""
        start_zoom = max(self.min_zoom, self.max_zoom - int(math.log2(float(self.max_size) / float(self.min_size))))
        if zoom < start_zoom:
            return self.min_size
        return self.min_size * (2 ** zoom - start_zoom)

    def alpha(self, zoom: int) -> float:
        """Get the point opacity."""
        start_zoom = max(self.min_zoom, self.max_zoom - int(math.log2(float(self.max_size) / float(self.min_size))))
        if zoom >= start_zoom:
            return 1.0
        return 0.9 ** (start_zoom - zoom)


class TileGenerator:
    """Recursive tiles generator."""

    # Tiles detail file
    DETAILS_FILE = "details.json"

    def __init__(
        self,
        point_style: PointStyle = None,
        min_zoom: int = 0,
        max_zoom: int = 10,
        rel_ignored_outliers: float = 0.001,
    ):
        self.min_zoom: int = min_zoom
        self.max_zoom: int = max_zoom
        self.rel_ignored: float = rel_ignored_outliers
        self.point_style: PointStyle = point_style or SimplePointStyle(min_zoom=min_zoom, max_zoom=max_zoom)

    def generate_tiles(
        self,
        points: np.ndarray,
        output_directory: str,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ):
        """Generate tile images for a collection of points."""
        progress.scale(1.0)
        self.save_blank(output_directory)
        bbox = BBox.calculate(points, self.rel_ignored).squared()
        root_tile = Tile(x=0, y=0, zoom=0, bbox=bbox)
        progress.increase(0.01)
        tiles_count = self.tiles_count(zoom=root_tile.zoom, max_zoom=self.max_zoom)
        progress = progress.bar(scale=tiles_count, unit="tiles")
        self.make_tiles_recursive(points, root_tile, output_directory, progress.remaining())
        self._write_details(output_directory, root_tile.bbox)

    def make_tiles_recursive(
        self,
        points: np.ndarray,
        tile: Tile,
        output_directory: str,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ):
        tiles_count = self.tiles_count(zoom=tile.zoom, max_zoom=self.max_zoom)
        progress.scale(tiles_count)
        if tile.zoom > self.max_zoom:
            progress.complete()
            return
        point_size = self.point_style.size(tile.zoom)
        tile_size = 256.0
        points = tile.bbox.select(points, rel_margin=point_size / tile_size)
        if len(points) == 0:
            progress.complete()
            return
        figure = self.draw_tile(points, tile)
        progress.increase(1)
        self.save_tile(figure, tile, output_directory)
        plt.close(figure)
        for subtile in tile.subtiles():
            self.make_tiles_recursive(points, subtile, output_directory, progress.subtask((tiles_count - 1) / 4))
        progress.complete()

    def draw_tile(self, points: np.ndarray, tile: Tile) -> Figure:
        figure, axes = self._make_figure()
        axes.set_xlim(*tile.bbox.x_lim)
        axes.set_ylim(*tile.bbox.y_lim)
        axes.scatter(
            points[:, 0],
            points[:, 1],
            s=math.pi * ((self.point_style.size(tile.zoom) / 2.0) ** 2),
            alpha=self.point_style.alpha(tile.zoom),
        )
        return figure

    @staticmethod
    def save_tile(figure: Figure, tile, output_root_dir, format="png"):
        """Save tile file."""
        directory = os.path.join(output_root_dir, f"zoom_{tile.zoom}")
        os.makedirs(directory, exist_ok=True)
        figure_path = os.path.join(directory, f"tile_{tile.x}_{tile.y}.{format}")
        figure.savefig(figure_path, format=format, bbox_inches="tight", pad_inches=0)

    @staticmethod
    def _make_figure() -> Tuple[Figure, Axes]:
        dpi = 96
        # MAGIC! The size is not 256.0/dpi because it is extremely hard to
        # get rid of matplotlib margins, paddings and whitespaces...
        size = (285.0 / dpi, 285.0 / dpi)
        figure: Figure = plt.figure(figsize=size, dpi=dpi, tight_layout=True)
        axes: Axes = figure.gca()
        axes.axis("off")
        return figure, axes

    @staticmethod
    def tiles_count(zoom: int, max_zoom: int) -> int:
        """Calculate number of tiles to be generated."""
        # This is simply a sum of geometric progression,
        # as each tile is split into 4 smaller tiles on
        # the next zoom level.
        return (4 ** (max_zoom - zoom + 1) - 1) / 3

    def save_blank(self, output_directory: str, format="png"):
        """Save default blank tile."""
        figure, _ = self._make_figure()
        os.makedirs(output_directory, exist_ok=True)
        figure_path = os.path.join(output_directory, f"blank.{format}")
        figure.savefig(figure_path, format=format, bbox_inches="tight", pad_inches=0)

    def _point_size_embedding(self, bbox: BBox):
        """Get the point size in embeddings space."""
        max_width = bbox.width
        min_width = bbox.width / (2 ** (self.max_zoom - self.min_zoom))
        return max(
            float(self.point_style.size(self.min_zoom)) / 256 * max_width,
            float(self.point_style.size(self.max_zoom)) / 256 * min_width,
        )

    def _write_details(self, output_directory: str, bbox: BBox):
        """Create a file indicating successful completion."""
        done_path = os.path.join(output_directory, self.DETAILS_FILE)
        with luigi.LocalTarget(done_path).open("w") as done:
            details = {
                "bbox": {
                    "x": [bbox.min_x, bbox.max_x],
                    "y": [bbox.min_y, bbox.max_y],
                },
                "point_size": self._point_size_embedding(bbox),
            }
            json.dump(details, done, indent=4)


class EmbeddingsTilesTarget(FileWithTimestampTarget):
    def exists(self):
        if not super().exists():
            return False
        details_file = os.path.join(self.latest_result_path, TileGenerator.DETAILS_FILE)
        return os.path.isfile(details_file)


class EmbeddingsTilesTask(PipelineTask, abc.ABC):
    """Base task for tiles generation."""

    prefix: str = luigi.Parameter(default=".")
    max_zoom: int = luigi.IntParameter(default=8)
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    @abc.abstractmethod
    def requires(self):
        """Read condensed embeddings."""

    def output(self) -> FileWithTimestampTarget:
        coll = self.pipeline.coll
        return EmbeddingsTilesTarget(
            path_prefix=self.result_directory,
            name_suffix=".d",
            need_updates=lambda time: coll.any(prefix=self.prefix, min_mtime=time),
        )

    def run(self):
        self.logger.info("Reading %s embeddings", self.algorithm_name)
        embeddings_input: CondensedFingerprintsTarget = self.input()
        embeddings = embeddings_input.read(self.progress.subtask(0.1))
        self.logger.info("Loaded %s %s embeddings", len(embeddings), self.algorithm_name)

        target = self.output()
        previous_results_path = target.latest_result_path
        new_result_time = self.pipeline.coll.max_mtime(prefix=self.prefix)
        new_result_dir = target.suggest_path(new_result_time)

        self.logger.info("Generating tiles for %s embeddings into %s", self.algorithm_name, new_result_dir)
        style = SimplePointStyle(max_zoom=self.max_zoom)
        generator = TileGenerator(max_zoom=self.max_zoom, point_style=style)
        generator.generate_tiles(embeddings.fingerprints, new_result_dir, self.progress.subtask(0.9))
        self.logger.info("All tiles are saved into %s", new_result_time)

        if previous_results_path is not None and self.clean_existing:
            self.logger.info("Removing previous results: %s", previous_results_path)
            shutil.rmtree(previous_results_path, ignore_errors=False, onerror=None)

    @property
    @abc.abstractmethod
    def algorithm_name(self) -> str:
        """Embedding algorithm name."""

    @property
    def result_directory(self) -> str:
        """Result directory path."""
        dir_name = f"tiles_{self.max_zoom}zoom"
        return os.path.join(self.output_directory, "embeddings", self.algorithm_name.lower(), self.prefix, dir_name)


class PaCMAPTilesTask(EmbeddingsTilesTask):
    """Generate tiles for PaCMAP embeddings."""

    def requires(self):
        return PaCMAPEmbeddingsTask(config=self.config, prefix=self.prefix)

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"


class TriMAPTilesTask(EmbeddingsTilesTask):
    """Generate tiles for TriMAP embeddings."""

    def requires(self):
        return TriMapEmbeddingsTask(config=self.config, prefix=self.prefix)

    @property
    def algorithm_name(self) -> str:
        return "TriMAP"


class TSNETilesTask(EmbeddingsTilesTask):
    """Generate tiles for t-SNE embeddings."""

    def requires(self):
        return TSNEEmbeddingsTask(config=self.config, prefix=self.prefix)

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"


class UMAPTilesTask(EmbeddingsTilesTask):
    """Generate tiles for UMAP embeddings."""

    def requires(self):
        return UmapEmbeddingsTask(config=self.config, prefix=self.prefix)

    @property
    def algorithm_name(self) -> str:
        return "UMAP"
