import initialState from "./initialState";
import { ACTION_CACHE_OBJECTS } from "./actions";
import { ACTION_CREATE_TEMPLATE_FILE_EXCLUSION } from "../../../file-exclusion/state/actions";

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
    case ACTION_CREATE_TEMPLATE_FILE_EXCLUSION: {
      const { exclusion } = action;
      const objects = state.objects[exclusion.file.id];
      if (objects == null) {
        return state;
      }
      const updatedObjects = objects.filter(
        (object) => object.templateId !== exclusion.template.id
      );
      return {
        ...state,
        objects: { ...state.objects, [exclusion.file.id]: updatedObjects },
      };
    }
    default:
      return state;
  }
}
