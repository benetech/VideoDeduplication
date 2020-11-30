"""The matches module offers high-level operations with matches."""


def filter_results(threshold, distances, indices):
    results = []
    results_distances = []
    mask = distances < threshold
    for i, r in enumerate(mask):
        results.append(indices[i, r])
        results_distances.append(distances[i, r])
    return results, results_distances
