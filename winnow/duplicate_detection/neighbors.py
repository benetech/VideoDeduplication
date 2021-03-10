"""This module offers functions to find duplicates among the nearest neighbors."""
from typing import Any, Dict, Collection, Tuple

from cached_property import cached_property
from .annoy_neighbors import AnnoyNNeighbors


class NeighborMatcher:
    """NeighborMatcher is a low-level feature-vector duplicate detector based on nearest neighbor evaluation.

    NeighborMatcher takes a (potentially larger) set of feature-vectors (a haystack) and builds a reusable index based
    based on that vectors. Then it allows to search near-duplicates for any set of feature-vectors (needles) among the
    haystack vectors.

    The NeighborMatcher is a low-level meaning it knows nothing about the origin and the semantics of the
    feature-vectors it operates on.
    """

    def __init__(
        self,
        haystack: Dict[Any, Collection[float]],
        max_matches=20,
        metric="euclidean",
    ):
        haystack_ids, haystack_vectors = map(tuple, zip(*haystack.items()))
        self._haystack_ids = haystack_ids
        self._haystack_vectors = haystack_vectors
        self._max_matches = max_matches
        self._metric = metric

    @cached_property
    def model(self) -> AnnoyNNeighbors:
        neighbors = min(self._max_matches, len(self._haystack_vectors))
        nearest_neighbors = AnnoyNNeighbors(n_neighbors=neighbors, metric=self._metric)
        nearest_neighbors.fit(self._haystack_vectors)
        return nearest_neighbors

    def find_matches(
        self,
        needles: Dict[Any, Collection[float]],
        max_distance: float = None,
    ) -> Collection[Tuple[Any, Any, float]]:
        """Find close matches of needle-vectors among haystack-vectors set.

        Returns:
            Array of shape (n_matches, 3) containing tuples (needle, haystack, dist),
                where needle represents id of the needle-vector, haystack represents id
                of the haystack vector, dist represents distance between the two.
        """
        needle_ids, needle_vectors = map(tuple, zip(*needles.items()))
        distances, indices = self.model.kneighbors(needle_vectors)

        if max_distance is not None:
            distances, indices = self._filter_results(distances, indices, threshold=max_distance)

        sorted_results = sorted(zip(needle_ids, indices, distances), key=lambda entry: len(entry[1]), reverse=True)
        seen = set()
        results = []

        for needle_id, haystack_indices, distances in sorted_results:
            for haystack_index, distance in zip(haystack_indices, distances):
                haystack_id = self._haystack_ids[haystack_index]
                # Skip duplicates
                if (needle_id, haystack_id) in seen:
                    continue
                # Skip self-matches
                if needle_id == haystack_id:
                    continue
                results.append((needle_id, haystack_id, distance))
                seen.add((needle_id, haystack_id))
                seen.add((haystack_id, needle_id))

        return results

    def _filter_results(self, distances, indices, threshold):
        results_indices = []
        results_distances = []
        mask = distances < threshold
        for i, r in enumerate(mask):
            results_indices.append(indices[i, r])
            results_distances.append(distances[i, r])
        return results_distances, results_indices
