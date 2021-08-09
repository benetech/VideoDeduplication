import initialState from "./initialState";
import { ACTION_CACHE_TASK } from "./actions";
import { ACTION_UPDATE_TASK } from "../tasks/actions";
import {
  cacheValue,
  entityCacheReducer,
  updateValue,
} from "../../common/cache";

/**
 * Root reducer for task cache.
 */
export default function taskCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_TASK: {
      return entityCacheReducer(state, cacheValue(action.task.id, action.task));
    }
    case ACTION_UPDATE_TASK: {
      return entityCacheReducer(
        state,
        updateValue(action.task.id, action.task)
      );
    }
    default:
      return state;
  }
}
