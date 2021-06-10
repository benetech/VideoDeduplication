"""The matches module offers high-level operations with matches."""
import pandas as pd
from winnow.duplicate_detection.annoy_neighbors import AnnoyNNeighbors

# from memory_profiler import profile
import gc
from tqdm import tqdm


def unique(row):
    return "".join([str(x) for x in sorted([row["query"], row["match"]])])


def filter_results(threshold, distances, indices):
    results = []
    results_distances = []
    mask = distances < threshold
    for i, r in tqdm(enumerate(mask), desc="Filtering out matches below specified threshold:"):
        results.append(indices[i, r])
        results_distances.append(distances[i, r])
    return results, results_distances


# @profile(precision=4)
def get_summarized_matches(video_signatures, distance=0.75):

    neighbors = min(20, video_signatures.shape[0])
    nn = AnnoyNNeighbors(n_neighbors=neighbors, metric="euclidean")

    nn.fit(video_signatures)

    distances, indices = nn.kneighbors(video_signatures)
    del video_signatures
    gc.collect()
    results, results_distances = filter_results(distance, distances, indices)
    del distances, indices
    gc.collect()

    q = []
    m = []
    distance = []

    for i, r in tqdm(enumerate(results), desc="Building report"):
        for j, matches in enumerate(r):
            if j == 0:
                qq = matches
            q.append(qq)
            m.append(matches)
            distance.append(results_distances[i][j])
    del results, results_distances
    gc.collect()
    match_df = pd.DataFrame({"query": q, "match": m, "distance": distance})
    return match_df
