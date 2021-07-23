import { selectObjectCache } from "../../../collection/state/selectors";
import { getEntity } from "../../common/entityCache/initialState";

/**
 * Get cached file objects.
 */
export function selectFileObjects(fileId, cacheSelector = selectObjectCache()) {
  return (state) => getEntity(cacheSelector(state), fileId);
}
