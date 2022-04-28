import abc
import os
from typing import Dict, List, Tuple

import luigi
import numpy as np
import pandas as pd

from winnow.pipeline.luigi.condense import CondensedFingerprintsTarget, CondensedFingerprints
from winnow.pipeline.luigi.embeddings import (
    EmbeddingsTask,
    UmapEmbeddingsTask,
    TriMapEmbeddingsTask,
    TSNEEmbeddingsTask,
    PaCMAPEmbeddingsTask,
)
from winnow.pipeline.luigi.embeddings_image import LabeledEmbeddingsImageTask
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.utils import FileKeyDF


class PrepareCCWeb(PipelineTask):
    """Prepare condensed ccweb fingerprints."""

    def output(self) -> CondensedFingerprintsTarget:
        return CondensedFingerprintsTarget(output_directory=self.output_directory, name="condensed_fingerprints")

    def run(self):
        self.logger.info("Loading fingerprints.")
        fingerprints = np.load(self.output().fingerprints_file_path)
        self.logger.info("Loaded %s fingerprints", len(fingerprints))
        self.progress.increase(0.1)

        file_labels_csv = os.path.join(self.output_directory, "vcdb_files_labels.csv")
        self.logger.info("Loading labeled ccweb videos list %s", file_labels_csv)
        file_labels = pd.read_csv(file_labels_csv, index_col=0)
        self.logger.info("Loaded %s labeled file names", len(file_labels.index))
        self.progress.increase(0.1)

        self.logger.info("Creating file-keys dataframe")
        path_hash_pairs = []
        for entry in file_labels.to_pandas().itertuples():
            path_hash_pairs.append((os.path.join(entry.label, entry.basename), ""))
        file_keys_df = FileKeyDF.make(tuples=path_hash_pairs, progress=self.progress.subtask(0.7))
        self.logger.info("Created file-keys dataframe")

        condensed = CondensedFingerprints(fingerprints, file_keys_df)
        self.logger.info("Saving condensed fingerprints")
        self.output().write(condensed)
        self.logger.info("Saving file-keys is done")


class CCWebImageTask(LabeledEmbeddingsImageTask):
    """Draw CCWeb embeddings with the corresponding category labels."""

    def requires(self):
        yield PrepareCCWeb(config=self.config)
        yield self.embeddings_task

    def read_embeddings(self) -> CondensedFingerprints:
        embeddings_input: CondensedFingerprintsTarget = self.input()[1]
        return embeddings_input.read()

    def get_colors(self, condensed_embeddings: CondensedFingerprints) -> Tuple[List[int], List[str]]:
        label_counts = {}
        file_labels = []
        self.logger.info("Retrieving ccweb labels")
        for file_key in condensed_embeddings.to_file_keys():
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


class CCWebUmapImageTask(CCWebImageTask):
    """Draw UMAP projection of CCWeb videos."""

    @property
    def algorithm_name(self) -> str:
        return "UMAP"

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return UmapEmbeddingsTask(config=self.config)


class CCWebTriMapImageTask(CCWebImageTask):
    """Draw TriMap projection of CCWeb videos."""

    @property
    def algorithm_name(self) -> str:
        return "TriMap"

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TriMapEmbeddingsTask(config=self.config)


class CCWebPaCMAPImageTask(CCWebImageTask):
    """Draw PaCMAP projection of CCWeb videos."""

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return PaCMAPEmbeddingsTask(config=self.config)


class CCWebTSNEImageTask(CCWebImageTask):
    """Draw t-SNE projection of CCWeb videos."""

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"

    @property
    def embeddings_task(self) -> EmbeddingsTask:
        return TSNEEmbeddingsTask(config=self.config)


class AllCCWebImagesTask(PipelineTask):
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
        yield CCWebTSNEImageTask(**params)
        yield CCWebPaCMAPImageTask(**params)
        yield CCWebUmapImageTask(**params)
        yield CCWebTriMapImageTask(**params)

    def all_params_dict(self) -> Dict:
        """Get all task params as dict."""
        return {name: getattr(self, name) for name in AllCCWebImagesTask.get_param_names()}
