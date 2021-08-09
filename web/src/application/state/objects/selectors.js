import { selectObjectCache } from "../root/selectors";
import { getEntry } from "../../common/cache/initialState";

/**
 * Get cached file objects.
 */
export function selectFileObjects(fileId, cacheSelector = selectObjectCache()) {
  return (state) => getEntry(cacheSelector(state), fileId);
}
