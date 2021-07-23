import lodash from "lodash";
import initialState from "./initialState";
import { ACTION_CACHE_OBJECTS, ACTION_UPDATE_OBJECT } from "./actions";
import { ACTION_CREATE_TEMPLATE_FILE_EXCLUSION } from "../../file-exclusion/state/actions";
import updateEntityList from "../../common/helpers/updateEntityList";
import {
  cacheEntity,
  entityCacheReducer,
  updateFunc,
} from "../../common/entityCache";

/**
 * Root reducer for object cache.
 */
export default function objectCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_OBJECTS:
      return entityCacheReducer(
        state,
        cacheEntity(action.fileId, action.objects)
      );
    case ACTION_CREATE_TEMPLATE_FILE_EXCLUSION: {
      const { exclusion } = action;
      return updateFunc(state, exclusion.file.id, (objects) =>
        lodash.reject(
          objects,
          (object) => object.templateId === exclusion.template.id
        )
      );
    }
    case ACTION_UPDATE_OBJECT: {
      const updated = action.object;
      return updateFunc(state, updated.fileId, (objects) =>
        updateEntityList(objects, updated)
      );
    }
    default:
      return state;
  }
}
