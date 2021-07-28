import { selectObjectCache } from "../../../collection/state/selectors";
import { getEntry } from "../../common/cache/initialState";

/**
 * Get cached file objects.
 */
export function selectFileObjects(fileId, cacheSelector = selectObjectCache()) {
  return (state) => getEntry(cacheSelector(state), fileId);
}
