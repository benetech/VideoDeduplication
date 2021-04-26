import initialState from "./initialState";
import { ACTION_CACHE_OBJECTS } from "./actions";

/**
 * Root reducer for object cache.
 */
export default function objectCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_OBJECTS: {
      const objects = { ...state.objects, [action.fileId]: action.objects };
      const history = [
        action.fileId,
        ...state.history.filter((id) => id !== action.fileId),
      ];
      if (history.length > state.maxSize) {
        const evicted = history.pop();
        delete objects[evicted];
      }
      return { ...state, history, objects };
    }
    default:
      return state;
  }
}
