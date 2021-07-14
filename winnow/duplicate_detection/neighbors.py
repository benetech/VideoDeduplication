"""This module offers functions to find duplicates among the nearest neighbors."""
from typing import Any, Collection, Sequence, Iterable

from cached_property import cached_property
from dataclasses import dataclass

from .annoy_neighbors import AnnoyNNeighbors


@dataclass(frozen=True)
class FeatureVector:
    """
    FeatureVector is a single point in a dataset for neighbor detection.

    The `key` attribute may be anything that associates a feature-vector with the corresponding object in the real world
    (e.g. it could be an entity id in a database, or filepath of the corresponding file, or any other natural key).
    """

    key: Any
    features: Sequence[float]


@dataclass(frozen=True)
class DetectedMatch:
    """Match represents a pair of close feature-vectors."""

    needle_key: Any
    haystack_key: Any
    distance: float


class NeighborMatcher:
    """NeighborMatcher is a low-level feature-vector duplicate detector based on nearest neighbor evaluation.

    NeighborMatcher takes a (potentially larger) set of feature-vectors (a haystack) and builds a reusable index based
    on that vectors. Then it allows to search near-duplicates for any set of feature-vectors (needles) among the
    haystack vectors.

    The NeighborMatcher is a low-level meaning it knows nothing about the origin and the semantics of the
    feature-vectors it operates on.
    """

    def __init__(
        self,
        haystack: Iterable[FeatureVector],
        max_matches=20,
        metric="euclidean",
    ):
        self._haystack = tuple(haystack)
        self._max_matches = max_matches
        self._metric = metric

    @cached_property
    def model(self) -> AnnoyNNeighbors:
        neighbors = min(self._max_matches, len(self._haystack))
        nearest_neighbors = AnnoyNNeighbors(n_neighbors=neighbors, metric=self._metric)
        nearest_neighbors.fit([vector.features for vector in self._haystack])
        return nearest_neighbors

    def find_matches(
        self,
        needles: Iterable[FeatureVector],
        max_distance: float = None,
    ) -> Collection[DetectedMatch]:
        """Find close matches of needle-vectors among haystack-vectors set."""
        needles = tuple(needles)
        distances, indices = self.model.kneighbors([needle.features for needle in needles])

        if max_distance is not None:
            distances, indices = self._filter_results(distances, indices, threshold=max_distance)

        sorted_results = sorted(zip(needles, indices, distances), key=lambda entry: len(entry[1]), reverse=True)
        seen = set()
        results = []

        for needle, haystack_indices, distances in sorted_results:
            for haystack_index, distance in zip(haystack_indices, distances):
                haystack_item = self._haystack[haystack_index]
                # Skip duplicates
                if (needle.key, haystack_item.key) in seen:
                    continue
                # Skip self-matches
                if needle.key == haystack_item.key:
                    continue
                results.append(DetectedMatch(needle_key=needle.key, haystack_key=haystack_item.key, distance=distance))
                seen.add((needle.key, haystack_item.key))
                seen.add((haystack_item.key, needle.key))

        return results

    def _filter_results(self, distances, indices, threshold):
        results_indices = []
        results_distances = []
        mask = distances < threshold
        for i, row in enumerate(mask):
            results_indices.append(indices[i, row])
            results_distances.append(distances[i, row])
        return results_distances, results_indices
