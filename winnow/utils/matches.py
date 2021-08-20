"""The matches module offers high-level operations with matches."""
import pandas as pd
from ..duplicate_detection.annoy_neighbors import AnnoyNNeighbors


def unique(row):
    return "".join([str(x) for x in sorted([row["query"], row["match"]])])


def filter_results(threshold, distances, indices):
    results = []
    results_distances = []
    mask = distances < threshold
    for i, r in enumerate(mask):
        results.append(indices[i, r])
        results_distances.append(distances[i, r])
    return results, results_distances


def get_summarized_matches(video_signatures, distance=0.75, metric="cosine"):

    neighbors = min(20, video_signatures.shape[0])
    nn = AnnoyNNeighbors(n_neighbors=neighbors, metric=metric)
    nn.fit(video_signatures)

    distances, indices = nn.kneighbors(video_signatures)
    results, results_distances = filter_results(distance, distances, indices)

    ss = sorted(zip(results, results_distances), key=lambda x: len(x[0]), reverse=True)
    results_sorted = [x[0] for x in ss]
    results_sorted_distance = [x[1] for x in ss]

    q = []
    m = []
    distance = []

    for i, r in enumerate(results_sorted):
        for j, matches in enumerate(r):
            if j == 0:
                qq = matches
            q.append(qq)
            m.append(matches)
            distance.append(results_sorted_distance[i][j])

    match_df = pd.DataFrame({"query": q, "match": m, "distance": distance})
    return match_df
