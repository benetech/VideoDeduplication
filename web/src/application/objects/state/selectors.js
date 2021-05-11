import { selectObjectCache } from "../../../collection/state/selectors";

/**
 * Get cached file objects.
 */
export function selectFileObjects(fileId, cacheSelector = selectObjectCache()) {
  return (state) => cacheSelector(state).objects[fileId];
}
