import abc
import os

import luigi
from cached_property import cached_property

from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprintsTarget, CondensedFingerprints
from winnow.pipeline.luigi.platform import PipelineTask
from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor


class EmbeddingsTask(PipelineTask, abc.ABC):
    """Abstract task to perform dimension reduction of fingerprints collection."""

    prefix: str = luigi.Parameter(default=".")
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def run(self):
        target = self.output()
        previous_results_paths, _ = target.latest_result

        self.logger.info("Loading condensed fingerprints")
        _, results_time = self.input().latest_result
        condensed = self.read_fingerprints(self.progress.subtask(0.1))
        self.logger.info("Loaded %s fingerprints", len(condensed))

        self.logger.info(f"Reducing fingerprint dimensions using {self.algorithm_name}")
        embeddings = self.fit_transform(condensed)
        self.logger.info(f"{self.algorithm_name} dimension reduction is done")
        self.progress.increase(0.8)

        self.logger.info("Saving embeddings to %s", target.suggest_paths(results_time))
        target.write(embeddings)
        self.logger.info("Saving embeddings done")

        if previous_results_paths is not None and self.clean_existing:
            for path in previous_results_paths:
                self.logger.info("Removing previous results: %s", path)
                os.remove(path)

    def output(self) -> CondensedFingerprintsTarget:
        return CondensedFingerprintsTarget(
            output_directory=os.path.join(self.output_directory, "embeddings", self.algorithm_name.lower()),
            prefix=self.prefix,
            name=self.output_name,
            coll=self.pipeline.coll,
        )

    def requires(self):
        return CondenseFingerprintsTask(config=self.config, prefix=self.prefix)

    def read_fingerprints(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> CondensedFingerprints:
        """Read fingerprints."""
        return self.input().read(progress)

    @cached_property
    def output_name(self) -> str:
        """File path to save embeddings."""
        return f"{self.algorithm_name.lower()}_embeddings"

    @property
    @abc.abstractmethod
    def algorithm_name(self) -> str:
        """Dimension reduction algorithm name."""
        pass

    @abc.abstractmethod
    def fit_transform(self, original: CondensedFingerprints) -> CondensedFingerprints:
        """Perform dimension reduction."""
        pass


class UmapEmbeddingsTask(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using UMAP.

    See https://umap-learn.readthedocs.io/en/latest/
    """

    max_fingerprints: int = luigi.IntParameter(default=100000)

    @property
    def algorithm_name(self) -> str:
        return "UMAP"

    def fit_transform(self, original: CondensedFingerprints) -> CondensedFingerprints:
        import umap

        reducer = umap.UMAP(random_state=42, n_neighbors=100)
        reducer.fit(original.fingerprints)
        embeddings = reducer.transform(original.fingerprints)
        return CondensedFingerprints(fingerprints=embeddings, file_keys_df=original.file_keys_df)

    def read_fingerprints(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> CondensedFingerprints:
        return super().read_fingerprints(progress)[: self.max_fingerprints]


class TriMapEmbeddingsTask(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using TriMAP algorithm.

    See https://github.com/eamid/trimap
    """

    @property
    def algorithm_name(self) -> str:
        return "TriMap"

    def fit_transform(self, original: CondensedFingerprints) -> CondensedFingerprints:
        import trimap

        embeddings = trimap.TRIMAP().fit_transform(original.fingerprints)
        return CondensedFingerprints(fingerprints=embeddings, file_keys_df=original.file_keys_df)


class PaCMAPEmbeddingsTask(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using PaCMAP algorithm.

    See https://github.com/YingfanWang/PaCMAP
    """

    @property
    def algorithm_name(self) -> str:
        return "PaCMAP"

    def fit_transform(self, original: CondensedFingerprints) -> CondensedFingerprints:
        import pacmap

        transformer = pacmap.PaCMAP(n_dims=2, n_neighbors=min(50, len(original)), MN_ratio=0.5, FP_ratio=2.0)
        embeddings = transformer.fit_transform(original.fingerprints)
        return CondensedFingerprints(fingerprints=embeddings, file_keys_df=original.file_keys_df)


class TSNEEmbeddingsTask(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using t-SNE algorithm.

    See https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html
    """

    max_fingerprints: int = luigi.IntParameter(default=20000)

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"

    def fit_transform(self, original: CondensedFingerprints) -> CondensedFingerprints:
        from sklearn.manifold import TSNE

        embeddings = TSNE(method="barnes_hut").fit_transform(original.fingerprints)
        return CondensedFingerprints(fingerprints=embeddings, file_keys_df=original.file_keys_df)

    def read_fingerprints(self, progress: BaseProgressMonitor = ProgressMonitor.NULL) -> CondensedFingerprints:
        return super().read_fingerprints(progress)[: self.max_fingerprints]


class AllEmbeddingsTask(PipelineTask):
    prefix: str = luigi.Parameter(default=".")
    clean_existing: bool = luigi.BoolParameter(default=True, significant=False)

    def requires(self):
        yield UmapEmbeddingsTask(config=self.config, prefix=self.prefix, clean_existing=self.clean_existing)
        yield PaCMAPEmbeddingsTask(config=self.config, prefix=self.prefix, clean_existing=self.clean_existing)
        yield TriMapEmbeddingsTask(config=self.config, prefix=self.prefix, clean_existing=self.clean_existing)
        yield TSNEEmbeddingsTask(config=self.config, prefix=self.prefix, clean_existing=self.clean_existing)
