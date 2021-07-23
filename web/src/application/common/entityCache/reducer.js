import lodash from "lodash";
import initialState, { getEntity, hasEntity } from "./initialState";
import {
  ACTION_CACHE_ENTITY,
  ACTION_DELETE_ENTITY,
  ACTION_UPDATE_ENTITY,
  cacheEntity,
} from "./actions";

/**
 * Update cache entry using the function.
 * @param {{items: {}, maxSize: number, history: string[]}} state - The initial state.
 * @param {string} key key of the entity that will be updated
 * @param {function} update function that transforms entity
 * @return {{items: {}, maxSize: number, history: string[]}}
 */
export function updateFunc(state, key, update) {
  // Do nothing if the key is not cached.
  if (!hasEntity(state, key)) {
    return state;
  }

  const entity = getEntity(state, key);
  const updated = update(entity);
  return entityCacheReducer(state, cacheEntity(key, updated));
}

/**
 * Root reducer for entity cache.
 * @param {{items: {}, maxSize: number, history: string[]}} state - The initial state that will be modified.
 * @param {{type: string: key: string, ?entity: Object}} action - Action that must be executed.
 * @return {{items: {}, maxSize: number, history: string[]}} The new state.
 */
export default function entityCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_ENTITY: {
      const items = { ...state.items, [action.key]: action.entity };
      const history = [
        action.key,
        ...state.history.filter((key) => key !== action.key),
      ];
      if (history.length > state.maxSize) {
        const evicted = history.pop();
        delete items[evicted];
      }
      return { ...state, items, history };
    }
    case ACTION_UPDATE_ENTITY: {
      if (!hasEntity(state, action.key)) {
        return state;
      }
      const currentEntity = state.items[action.key];
      const updatedEntity = lodash.merge({}, currentEntity, action.entity);
      const items = { ...state.items, [action.key]: updatedEntity };
      const history = [
        action.key,
        ...state.history.filter((key) => key !== action.key),
      ];
      return { ...state, items, history };
    }
    case ACTION_DELETE_ENTITY: {
      if (!hasEntity(state, action.key)) {
        return state;
      }
      const items = { ...state.items };
      delete items[action.key];
      const history = state.history.filter((key) => key !== action.key);
      return { ...state, items, history };
    }
    default:
      return state;
  }
}
