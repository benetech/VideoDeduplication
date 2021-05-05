/**
 * Get cached file exclusions.
 */
export function selectFileExclusions(cacheSelector, fileId) {
  return (state) => cacheSelector(state).exclusions[fileId];
}
