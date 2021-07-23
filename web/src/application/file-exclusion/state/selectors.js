/**
 * Get cached file exclusions.
 */
import { getEntity } from "../../common/entityCache/initialState";

export function selectFileExclusions(cacheSelector, fileId) {
  return (state) => getEntity(cacheSelector(state), fileId);
}
