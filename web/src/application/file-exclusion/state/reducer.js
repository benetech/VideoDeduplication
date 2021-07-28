import lodash from "lodash";
import initialState from "./initialState";
import {
  ACTION_CACHE_TEMPLATE_FILE_EXCLUSIONS,
  ACTION_CREATE_TEMPLATE_FILE_EXCLUSION,
  ACTION_DELETE_TEMPLATE_FILE_EXCLUSION,
} from "./actions";
import extendEntityList from "../../common/helpers/extendEntityList";
import compareFileExclusions from "../helpers/compareFileExclusions";
import { cacheValue, entityCacheReducer, updateFunc } from "../../common/cache";
import { hasEntry } from "../../common/cache/initialState";

// Insert new exclusion into the list
const insertExclusion = (exclusion) => (exclusions) =>
  extendEntityList(exclusions, [exclusion]).sort(compareFileExclusions);

/**
 * Root reducer for file-exclusions cache.
 */
export default function fileExclusionsCacheReducer(
  state = initialState,
  action
) {
  switch (action.type) {
    case ACTION_CACHE_TEMPLATE_FILE_EXCLUSIONS:
      return entityCacheReducer(
        state,
        cacheValue(action.fileId, action.exclusions)
      );
    case ACTION_CREATE_TEMPLATE_FILE_EXCLUSION: {
      const created = action.exclusion;
      const file = created.file;
      if (hasEntry(state, file.id)) {
        return updateFunc(state, file.id, insertExclusion(created));
      }
      return entityCacheReducer(state, cacheValue(file.id, [created]));
    }
    case ACTION_DELETE_TEMPLATE_FILE_EXCLUSION: {
      const deleted = action.exclusion;
      return updateFunc(state, deleted.file.id, (exclusions) =>
        lodash.reject(exclusions, (exclusion) => exclusion.id === deleted.id)
      );
    }
    default:
      return state;
  }
}
