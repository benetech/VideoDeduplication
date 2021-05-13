import initialState from "./initialState";
import lodash from "lodash";
import { ACTION_CACHE_OBJECTS, ACTION_UPDATE_OBJECT } from "./actions";
import { ACTION_CREATE_TEMPLATE_FILE_EXCLUSION } from "../../file-exclusion/state/actions";

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
    case ACTION_UPDATE_OBJECT: {
      const { object: updated } = action;
      const cachedObjects = state.objects[updated.fileId];

      // Do nothing if object is not present in cache
      if (cachedObjects == null) {
        return state;
      }

      const updatedObjects = cachedObjects.map((object) => {
        if (object.id === updated.id) {
          return lodash.merge({}, object, updated);
        }
        return object;
      });

      return {
        ...state,
        objects: {
          ...state.objects,
          [updated.fileId]: updatedObjects,
        },
      };
    }
    default:
      return state;
  }
}
