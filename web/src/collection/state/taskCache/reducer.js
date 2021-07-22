import initialState from "./initialState";
import { ACTION_CACHE_TASK } from "./actions";
import { ACTION_UPDATE_TASK } from "../tasks/actions";
import {
  cacheEntity,
  entityCacheReducer,
  updateEntity,
} from "../../../application/common/entityCache";

/**
 * Root reducer for task cache.
 */
export default function taskCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_TASK: {
      return entityCacheReducer(
        state,
        cacheEntity(action.task.id, action.task)
      );
    }
    case ACTION_UPDATE_TASK: {
      return entityCacheReducer(
        state,
        updateEntity(action.task.id, action.task)
      );
    }
    default:
      return state;
  }
}
