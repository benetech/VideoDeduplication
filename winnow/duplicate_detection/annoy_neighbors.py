from typing import Sequence

import numpy as np
from annoy import AnnoyIndex

from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor


class AnnoyNNeighbors:
    """
    Annoy wrapper that provides a similar interface to Scikit-learn's nearest
    neighbor api.

    Parameters
    ----------
    n_neighbors : int, default=20
        Number of neighbors to use by default for kneighbors queries.
        Larger values result in longer runtimes and increased memory usage.
    n_trees : int, default=10
        Number of trees to be used by Annoy to build its index. Larger values
        will result on more accurate results at the expense of increased memory
        usage.
    optimize_trees: bool, default=False
        Will scale the number of trees as the size of index grows using the
        square root of the dataset size divided by 2. If memory is not a
        constraint,this could result in improved performance.
    search_k_intensity: int, default = 100
        Generally, annoy will search (n_trees*n_neighbors) nodes in order to
        query its index. In order to improve results, we can have it search
        more nodes and return more accurate results at the expense of speed
        (without increases in memory consumption)

    """

    @staticmethod
    def _resolve_metric(metric: str) -> str:
        """Resolve annoy metric."""
        if metric == "cosine":
            return "angular"
        return metric

    @staticmethod
    def load(
        annoy_index_path: str,
        n_neighbors=20,
        metric="euclidean",
        n_trees=10,
        feature_size=500,
        search_k_intensity=100,
    ) -> "AnnoyNNeighbors":
        """Load AnnoyNNeighbors from file."""
        annoy_index = AnnoyIndex(feature_size, AnnoyNNeighbors._resolve_metric(metric))
        annoy_index.load(annoy_index_path)
        model = AnnoyNNeighbors(
            n_neighbors=n_neighbors,
            metric=metric,
            n_trees=n_trees,
            feature_size=feature_size,
            search_k_intensity=search_k_intensity,
        )
        model.annoy_index = annoy_index
        return model

    def __init__(
        self,
        n_neighbors=20,
        metric="euclidean",
        n_trees=10,
        optimize_trees=False,
        feature_size=500,
        search_k_intensity=100,
    ):
        self.n_neighbors = n_neighbors
        self.metric = self._resolve_metric(metric)
        self.feature_size = feature_size
        self.n_trees = n_trees
        self.optimize_trees = optimize_trees
        self.search_k_intensity = search_k_intensity
        self.search_k = self.search_k_intensity * (n_trees * n_neighbors)
        self.annoy_index = None

    def fit(self, data):
        annoy_index = AnnoyIndex(self.feature_size, self.metric)
        for i, v in enumerate(data):
            annoy_index.add_item(i, list(v))

        if self.optimize_trees:
            self.n_trees = self._optimize(data)
            self.search_k = self.search_k_intensity * (self.n_trees * self.n_neighbors)

        annoy_index.build(self.n_trees)
        self.annoy_index = annoy_index
        return self

    def kneighbors(
        self,
        data: Sequence[np.ndarray],
        optimize: bool = False,
        return_distance: bool = True,
        search_k_intensity: bool = False,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ):
        if search_k_intensity:
            self.search_k = search_k_intensity * (self.n_trees * self.n_neighbors)

        if optimize:
            self.n_neighbors = self._optimize(data)

        distances, indices = [], []
        progress = progress.bar(scale=len(data), unit="vectors")
        for features in data:
            vec_indices, vec_distances = self.annoy_index.get_nns_by_vector(
                features, self.n_neighbors, include_distances=True, search_k=self.search_k
            )
            distances.append(vec_distances)
            indices.append(vec_indices)
            progress.increase(1)

        distances = np.vstack(distances)
        indices = np.vstack(indices).astype(np.int)

        if self.metric == "angular":
            # convert distances to cosine distances from angular
            distances = np.power(distances, 2) / 2.0

        progress.complete()
        if not return_distance:
            return distances
        return distances, indices

    @staticmethod
    def _optimize(data):
        return int(np.sqrt(len(data)) / 2)
