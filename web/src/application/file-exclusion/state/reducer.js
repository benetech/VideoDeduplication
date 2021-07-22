import initialState from "./initialState";
import {
  ACTION_CACHE_TEMPLATE_FILE_EXCLUSIONS,
  ACTION_CREATE_TEMPLATE_FILE_EXCLUSION,
  ACTION_DELETE_TEMPLATE_FILE_EXCLUSION,
} from "./actions";
import extendEntityList from "../../common/helpers/extendEntityList";
import compareFileExclusions from "../helpers/compareFileExclusions";

/**
 * Root reducer for file-exclusions cache.
 */
export default function fileExclusionsCacheReducer(
  state = initialState,
  action
) {
  switch (action.type) {
    case ACTION_CACHE_TEMPLATE_FILE_EXCLUSIONS: {
      const exclusions = {
        ...state.exclusions,
        [action.fileId]: action.exclusions,
      };
      const history = [
        action.fileId,
        ...state.history.filter((id) => id !== action.fileId),
      ];
      if (history.length > state.maxSize) {
        const evicted = history.pop();
        delete exclusions[evicted];
      }
      return { ...state, history, exclusions };
    }
    case ACTION_CREATE_TEMPLATE_FILE_EXCLUSION: {
      const { exclusion } = action;
      const cacheEntry = state.exclusions[exclusion.file.id];
      if (cacheEntry == null) {
        return state;
      }
      const updatedEntry = extendEntityList(cacheEntry, [exclusion]).sort(
        compareFileExclusions
      );
      const exclusions = {
        ...state.exclusions,
        [exclusion.file.id]: updatedEntry,
      };
      return { ...state, exclusions };
    }
    case ACTION_DELETE_TEMPLATE_FILE_EXCLUSION: {
      const { exclusion: deleted } = action;
      const cacheEntry = state.exclusions[deleted.file.id];
      if (cacheEntry == null) {
        return state;
      }
      const updatedEntry = cacheEntry.filter(
        (exclusion) => exclusion.id !== deleted.id
      );
      const exclusions = {
        ...state.exclusions,
        [deleted.file.id]: updatedEntry,
      };
      return { ...state, exclusions };
    }
    default:
      return state;
  }
}
