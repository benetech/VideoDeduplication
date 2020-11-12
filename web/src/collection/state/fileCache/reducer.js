import initialState from "./initialState";
import { ACTION_CACHE_FILE } from "./actions";

/**
 * Root reducer for file cache.
 * @param {Object} state - The initial state that will be modified.
 * @param {CacheFileAction|Object} action - Action that must be executed.
 * @return {Object} The new state.
 */
export default function fileCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_FILE: {
      const files = { ...state.files, [action.file.id]: action.file };
      const history = [
        action.file.id,
        ...state.history.filter((id) => id !== action.file.id),
      ];
      if (history.length > state.maxSize) {
        const evicted = history.pop();
        delete files[evicted];
      }
      return { ...state, history, files };
    }
    default:
      return state;
  }
}
