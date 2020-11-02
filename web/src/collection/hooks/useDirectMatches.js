import useMatches from "./useMatches";

/**
 * Load direct matches of the given file.
 * @param id mother file id.
 */
export function useDirectMatches(id) {
  const { matches, files, error, loadMatches, hasMore, total } = useMatches(
    id,
    {
      hops: 1,
    }
  );

  const motherFile = files[id];

  const seen = new Set();
  const directMatches = [];
  for (let match of matches) {
    if (match.source === id && !seen.has(match.target)) {
      seen.add(match.target);
      directMatches.push({
        id: match.id,
        file: files[match.target],
        distance: match.distance,
      });
    } else if (match.target === id && !seen.has(match.source)) {
      seen.add(match.source);
      directMatches.push({
        id: match.id,
        file: files[match.source],
        distance: match.distance,
      });
    }
  }

  const progress = total == null ? undefined : matches.length / total;

  return {
    file: motherFile,
    matches: directMatches,
    error,
    loadMatches,
    hasMore,
    progress,
  };
}

export default useDirectMatches;