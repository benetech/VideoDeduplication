import abc

from cached_property import cached_property

from winnow.pipeline.luigi.condense import CondenseFingerprintsTask, CondensedFingerprintsTarget, CondensedFingerprints
from winnow.pipeline.luigi.platform import PipelineTask


class EmbeddingsTask(PipelineTask, abc.ABC):
    """Abstract task to perform dimension reduction of fingerprints collection."""

    def run(self):
        self.logger.info("Loading fingerprints from cache")
        condensed = self.read_fingerprints()
        self.logger.info("Loaded %s fingerprints", len(condensed))
        self.progress.increase(0.005)

        self.logger.info(f"Reducing fingerprint dimensions using {self.algorithm_name}")
        embeddings = self.fit_transform(condensed)
        self.logger.info(f"{self.algorithm_name} dimension reduction is done")
        self.progress.increase(0.99)

        self.logger.info("Saving embeddings to %s", self.output().fingerprints_file_path)
        self.output().write(embeddings)
        self.logger.info("Saving embeddings done")

    def output(self) -> CondensedFingerprintsTarget:
        return CondensedFingerprintsTarget(output_directory=self.output_directory, name=self.output_name)

    def requires(self):
        return CondenseFingerprintsTask(config_path=self.config_path)

    def read_fingerprints(self) -> CondensedFingerprints:
        """Read fingerprints."""
        return self.input().read()

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

    @property
    def algorithm_name(self) -> str:
        return "UMAP"

    def fit_transform(self, original: CondensedFingerprints) -> CondensedFingerprints:
        import umap

        reducer = umap.UMAP(random_state=42, n_neighbors=100)
        reducer.fit(original.fingerprints)
        embeddings = reducer.transform(original.fingerprints)
        return CondensedFingerprints(fingerprints=embeddings, file_keys_df=original.file_keys_df)

    def read_fingerprints(self) -> CondensedFingerprints:
        return super().read_fingerprints()[:100000]


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

        transformer = pacmap.PaCMAP(n_dims=2, n_neighbors=min(100, len(original)), MN_ratio=0.5, FP_ratio=2.0)
        embeddings = transformer.fit_transform(original.fingerprints)
        return CondensedFingerprints(fingerprints=embeddings, file_keys_df=original.file_keys_df)


class TSNEEmbeddingsTask(EmbeddingsTask):
    """Reduce fingerprint dimensions to 2D space using t-SNE algorithm.

    See https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html
    """

    @property
    def algorithm_name(self) -> str:
        return "t-SNE"

    def fit_transform(self, original: CondensedFingerprints) -> CondensedFingerprints:
        from sklearn.manifold import TSNE

        embeddings = TSNE(method="barnes_hut").fit_transform(original.fingerprints)
        return CondensedFingerprints(fingerprints=embeddings, file_keys_df=original.file_keys_df)

    def read_fingerprints(self) -> CondensedFingerprints:
        return super().read_fingerprints()[:20000]


class AllEmbeddingsTask(PipelineTask):
    def requires(self):
        yield UmapEmbeddingsTask(config_path=self.config_path)
        yield PaCMAPEmbeddingsTask(config_path=self.config_path)
        yield TriMapEmbeddingsTask(config_path=self.config_path)
        yield TSNEEmbeddingsTask(config_path=self.config_path)
