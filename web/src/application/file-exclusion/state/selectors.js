/**
 * Get cached file exclusions.
 */
import { getEntry } from "../../common/cache/initialState";

export function selectFileExclusions(cacheSelector, fileId) {
  return (state) => getEntry(cacheSelector(state), fileId);
}
