import abc
import os

import luigi
from annoy import AnnoyIndex

from winnow.pipeline.luigi.condense import CondensedFingerprints
from winnow.pipeline.luigi.embeddings import (
    UmapEmbeddingsTask,
    TSNEEmbeddingsTask,
    TriMapEmbeddingsTask,
    PaCMAPEmbeddingsTask,
)
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.luigi.targets import FileGroupTarget


class EmbeddingsAnnoyIndexTask(PipelineTask, abc.ABC):
    """Build Annoy index for 2D fingerprint embeddings."""

    prefix: str = luigi.Parameter(default=".")
    n_trees: int = luigi.IntParameter(default=10)
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def run(self):
        target = self.output()
        new_results_time = self.pipeline.coll.max_mtime(prefix=self.prefix)
        previous_results_paths, _ = target.latest_result

        self.logger.info("Loading condensed %s embeddings", self.algorithm_name)
        embeddings: CondensedFingerprints = self.input().read(self.progress.subtask(0.1))
        self.logger.info("Loaded %s embeddings", len(embeddings))

        self.logger.info("Building Annoy index for %s embeddings", self.algorithm_name)
        annoy_index = AnnoyIndex(2, "euclidean")
        fitting_progress = self.progress.bar(0.6, scale=len(embeddings), unit="sigs")
        for i, fingerprint in enumerate(embeddings.fingerprints):
            annoy_index.add_item(i, fingerprint)
            fitting_progress.increase(1)
        fitting_progress.complete()
        self.logger.info("Added %s fingerprints to the index", len(embeddings))

        self.logger.info("Building annoy index.")
        annoy_index.build(self.n_trees)
        self.progress.increase(0.25)
        self.logger.info("Annoy index is prepared.")

        self.logger.info("Saving annoy index.")
        index_path, keys_path = target.suggest_paths(new_results_time)
        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        annoy_index.save(index_path)
        embeddings.file_keys_df.to_csv(keys_path)

        if self.clean_existing and previous_results_paths is not None:
            for path in previous_results_paths:
                self.logger.info("Removing previous results: %s", path)
                os.remove(path)

    def output(self) -> FileGroupTarget:
        coll = self.pipeline.coll
        return FileGroupTarget(
            common_prefix=os.path.join(
                self.output_directory,
                "embeddings",
                self.algorithm_name.lower(),
                self.prefix,
                "annoy_index",
            ),
            suffixes=(".annoy", ".files.csv"),
            need_updates=lambda time: coll.any(prefix=self.prefix, min_mtime=time),
        )

    @abc.abstractmethod
    def requires(self):
        """Read condensed embeddings."""

    @property
    @abc.abstractmethod
    def algorithm_name(self) -> str:
        """Embedding algorithm name."""


class PaCMAPAnnoyIndexTask(EmbeddingsAnnoyIndexTask):
    """Generate tiles for PaCMAP embeddings."""

    def requires(self):
        return PaCMAPEmbeddingsTask(config=self.config, prefix=self.prefix)

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"


class TriMAPAnnoyIndexTask(EmbeddingsAnnoyIndexTask):
    """Generate tiles for TriMAP embeddings."""

    def requires(self):
        return TriMapEmbeddingsTask(config=self.config, prefix=self.prefix)

    @property
    def algorithm_name(self) -> str:
        return "TriMAP"


class TSNEAnnoyIndexTask(EmbeddingsAnnoyIndexTask):
    """Generate tiles for t-SNE embeddings."""

    def requires(self):
        return TSNEEmbeddingsTask(config=self.config, prefix=self.prefix)

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"


class UMAPAnnoyIndexTask(EmbeddingsAnnoyIndexTask):
    """Generate tiles for UMAP embeddings."""

    def requires(self):
        return UmapEmbeddingsTask(config=self.config, prefix=self.prefix)

    @property
    def algorithm_name(self) -> str:
        return "UMAP"
