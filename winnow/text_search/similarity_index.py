import abc
import logging
import math
import os.path
import pickle
from typing import Optional, List, Tuple, Any, Union

import numpy as np
from annoy import AnnoyIndex
from sklearn.neighbors import KDTree, BallTree

from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor, LazyProgress, ProgressBar
from winnow.text_search.evaluation import cosine_sim, l2norm
from winnow.utils.logging import logger_name


class SimilarityIndex(abc.ABC):
    """API for a data-structure to query cosine-similar vectors."""

    @abc.abstractmethod
    def query(
        self,
        vector: np.ndarray,
        min_similarity: float,
        max_items: Optional[int] = None,
    ) -> List[Tuple[Any, float]]:
        """Query similar vectors and return (id, distance) pairs."""


# Type Hint for array-like objects
ArrayLike = Union[List[Any], np.ndarray]


class LinearSimilarityIndex(SimilarityIndex):
    """Find similar entries by considering all vectors from the collection one by one."""

    def __init__(self, ids: ArrayLike, vectors: np.ndarray):
        """
        Args:
            ids (np.ndarray): Array-like collection of shape (n_samples,) containing data ids.
            vectors (np.ndarray): Array-like collection of shape (n_samples, n_features) containing data vectors.
        """
        self._ids = np.array(ids)
        self._vectors = vectors
        self._logger = logging.getLogger(logger_name(self))
        if len(self._ids) != len(self._vectors):
            raise ValueError(f"Ids count did not match vectors count: {len(self._ids)} != {len(self._vectors)}")

    def query(
        self,
        vector: np.ndarray,
        min_similarity: float,
        max_items: Optional[int] = None,
    ) -> List[Tuple[Any, float]]:
        """Get all similar enough vectors from the index."""
        similarity = cosine_sim(np.array([vector]), self._vectors)[0]
        similarity_index = [(sim, index) for index, sim in enumerate(similarity) if sim >= min_similarity]
        similarity_index.sort(reverse=True)
        if max_items is not None and len(similarity_index) > max_items:
            similarity_index = similarity_index[:max_items]
        return [(self._ids[index], sim) for sim, index in similarity_index]

    def save(self, directory: str, index_name: str):
        """Save index to the file system."""
        ids_path, vectors_path = self._file_paths(directory, index_name)
        self._logger.info("Saving LinearSimilarityIndex with %s items to %s", len(self._vectors), vectors_path)
        np.save(ids_path, self._ids)
        np.save(vectors_path, self._vectors)
        self._logger.info("Saved LinearSimilarityIndex with %s items", len(self._vectors))

    @staticmethod
    def _file_paths(directory: str, index_name: str) -> Tuple[str, str]:
        """Get file paths for ids and vectors."""
        common_prefix = os.path.join(os.path.abspath(directory), index_name)
        return f"{common_prefix}.ids.npy", f"{common_prefix}.vectors.npy"

    @staticmethod
    def load(directory: str, index_name: str, allow_pickle: bool = False) -> "LinearSimilarityIndex":
        """Load linear index from the file system."""
        logger = logging.getLogger(logger_name(LinearSimilarityIndex))
        ids_path, vectors_path = LinearSimilarityIndex._file_paths(directory, index_name)
        logger.info("Loading LinearSimilarityIndex from %s", vectors_path)
        ids = np.load(ids_path, allow_pickle=allow_pickle)
        vectors = np.load(vectors_path)
        result = LinearSimilarityIndex(ids, vectors)
        logger.info("Loaded LinearSimilarityIndex with %s vectors", len(vectors))
        return result


# Type Hint for search tree
SearchTree = Union[KDTree, BallTree]


class SearchTreeIndex(SimilarityIndex):
    def __init__(self, ids: ArrayLike, search_tree: SearchTree, n_dimensions: int):
        self._ids: ArrayLike = ids
        self._search_tree: SearchTree = search_tree
        self._n_dimensions: int = n_dimensions

    def query(
        self,
        vector: np.ndarray,
        min_similarity: float,
        max_items: Optional[int] = None,
    ) -> List[Tuple[Any, float]]:
        radius = math.sqrt(2.0 * (1 - min_similarity) / self._n_dimensions)
        query_vectors = l2norm(np.array([vector]))
        indices, distances = self._search_tree.query_radius(query_vectors, radius, return_distance=True)
        return list(zip(self._ids[indices], distances))

    @staticmethod
    def _file_path(index_name, output_directory) -> str:
        """Get index file path."""
        return os.path.join(output_directory, f"{index_name}.pickle")

    def save(self, output_directory: str, index_name: str):
        """Save SearchTreeIndex to the file system."""
        path = self._file_path(index_name, output_directory)
        with open(path, "wb") as file:
            pickle.dump(self, file, protocol=4)

    @staticmethod
    def load(output_directory: str, index_name: str) -> "SearchTreeIndex":
        """Load search tree from the file system."""
        path = SearchTreeIndex._file_path(output_directory, index_name)
        with open(path, "rb") as file:
            return pickle.load(file)


class AnnoySimilarityIndex(SimilarityIndex):
    """Annoy-based similarity index."""

    logger = logging.getLogger(f"{__name__}.AnnoySimilarityIndex")

    def __init__(self):
        self._ids: Optional[np.ndarray] = None
        self._annoy_index: Optional[AnnoyIndex] = None

    def _ensure_fit(self):
        """Ensure index is initialized."""
        if self._ids is None or self._annoy_index is None:
            raise RuntimeError("Index is not initialized.")

    def fit(
        self,
        ids,
        vectors,
        n_trees: int = 10,
        progress: BaseProgressMonitor = ProgressMonitor.NULL,
    ) -> "AnnoySimilarityIndex":
        """Build annoy-based similarity index."""
        self._ids = ids
        progress.scale(1.0)
        n_features = vectors.shape[1]
        self._annoy_index = AnnoyIndex(f=n_features, metric="angular")
        index_progress = LazyProgress(ProgressBar(progress.subtask(0.5).scale(len(vectors)), unit="vectors"))
        for i, vector in enumerate(vectors):
            self._annoy_index.add_item(i, vector)
            index_progress.increase(1)
        index_progress.complete()
        self._annoy_index.build(n_trees=n_trees)
        progress.complete()
        return self

    def query(
        self,
        vector: np.ndarray,
        min_similarity: float,
        max_items: int = 10000,
    ) -> List[Tuple[Any, float]]:
        self._ensure_fit()
        indices, distances = self._annoy_index.get_nns_by_vector(vector, n=max_items, include_distances=True)

        results = []
        for index, angular_distance in zip(indices, distances):
            similarity = self._similarity(angular_distance)
            if similarity > min_similarity:
                results.append((self._ids[index], similarity))

        return results  # Already sorted

    def save(self, index_path: str, ids_path: str):
        """Save index to the file system."""
        self._ensure_fit()
        if not ids_path.endswith(".npy"):
            raise ValueError(f"ids_path must end with '.npy': {ids_path}")
        self.logger.info("Saving AnnoySimilarityIndex with %s items to %s", self._annoy_index.get_n_items(), index_path)
        os.makedirs(os.path.dirname(ids_path), exist_ok=True)
        np.save(ids_path, self._ids)
        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        self._annoy_index.save(index_path)
        self.logger.info("Saved AnnoySimilarityIndex")

    def load(
        self,
        index_path: str,
        ids_path: str,
        n_features: int,
        allow_pickle: bool = False,
    ) -> "AnnoySimilarityIndex":
        """Load linear index from the file system."""
        if self._ids is not None or self._annoy_index is not None:
            raise RuntimeError("Already initialized.")
        if not os.path.exists(ids_path):
            raise FileNotFoundError(f"Semantic text search IDs-index not found: {ids_path}")
        if not ids_path.endswith(".npy"):
            raise ValueError(f"ids_path must end with '.npy': {ids_path}")
        if not os.path.exists(index_path):
            raise FileNotFoundError(f"Semantic text search annoy index not found: {index_path}")
        self.logger.info("Loading similarity index from %s", index_path)
        self._annoy_index = AnnoyIndex(f=n_features, metric="angular")
        self._annoy_index.load(index_path)
        self.logger.info("Loading similarity index ids from %s", ids_path)
        self._ids = np.load(ids_path, allow_pickle=allow_pickle)
        if len(self._ids) != self._annoy_index.get_n_items():
            raise ValueError(
                "The number of ids doesn't match number of indexed vectors:"
                f" {len(self._ids)} != {self._annoy_index.get_n_items()}"
            )
        return self

    @staticmethod
    def _similarity(angular_distance: float) -> float:
        """
        Reverse Annoy's angular distance to cosine similarity.

        According to Annoy documentation, angular distance is calculated
        as sqrt(2(1-cos(u,v))) for normalized vectors u, v. This method
        reversed distance back to the cosine similarity (i.e. cos(u,v)).
        See: https://github.com/spotify/annoy#full-python-api
        """
        return 1.0 - (angular_distance ** 2) / 2.0
