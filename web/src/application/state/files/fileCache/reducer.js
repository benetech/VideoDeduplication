import initialState from "./initialState";
import { ACTION_CACHE_FILE, ACTION_UPDATE_FILE } from "./actions";
import {
  ACTION_DELETE_FILE_MATCH,
  ACTION_RESTORE_FILE_MATCH,
} from "../../fileMatches/actions";
import {
  cacheValue,
  entityCacheReducer,
  updateValue,
  updateFunc,
} from "../../../common/cache";

// Increment match count
const incMatchCount = (file) => ({
  ...file,
  matchesCount: file.matchesCount + 1,
});

// Decrement match count
const decMatchCount = (file) => ({
  ...file,
  matchesCount: file.matchesCount - 1,
});

/**
 * Root reducer for file cache.
 * @param {Object} state - The initial state that will be modified.
 * @param {CacheFileAction|Object} action - Action that must be executed.
 * @return {Object} The new state.
 */
export default function fileCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_FILE: {
      return entityCacheReducer(state, cacheValue(action.file.id, action.file));
    }
    case ACTION_UPDATE_FILE: {
      return entityCacheReducer(
        state,
        updateValue(action.file.id, action.file)
      );
    }
    case ACTION_DELETE_FILE_MATCH: {
      const { file: matchFile, motherFile } = action.match;
      state = updateFunc(state, matchFile.id, decMatchCount);
      state = updateFunc(state, motherFile.id, decMatchCount);
      return state;
    }
    case ACTION_RESTORE_FILE_MATCH: {
      const { file: matchFile, motherFile } = action.match;
      state = updateFunc(state, matchFile.id, incMatchCount);
      state = updateFunc(state, motherFile.id, incMatchCount);
      return state;
    }
    default:
      return state;
  }
}
