import lodash from "lodash";
import initialState, { getEntry, hasEntry } from "./initialState";
import {
  ACTION_CACHE_VALUE,
  ACTION_DELETE_ENTRY,
  ACTION_INVALIDATE_CACHE,
  ACTION_UPDATE_VALUE,
  cacheValue,
} from "./actions";

/**
 * Update cache entry using the function.
 * @param {ValueCache} cache - The initial state.
 * @param {string} key cache key which value will be updated
 * @param {function} updater function that transforms cached value
 * @return {ValueCache}
 */
export function updateFunc(cache, key, updater) {
  // Do nothing if the key is not cached.
  if (!hasEntry(cache, key)) {
    return cache;
  }

  const value = getEntry(cache, key);
  const updated = updater(value);
  return cacheReducer(cache, cacheValue(key, updated));
}

/**
 * Root reducer for simple key->value cache.
 * @param {ValueCache} state - The initial state that will be modified.
 * @param {{type: string: key: string, value}} action - Action that must be executed.
 * @return {ValueCache} The new state.
 */
export default function cacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_CACHE_VALUE: {
      const items = { ...state.items, [action.key]: action.value };
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
    case ACTION_UPDATE_VALUE: {
      if (!hasEntry(state, action.key)) {
        return state;
      }
      const currentValue = state.items[action.key];
      const updatedValue = lodash.merge({}, currentValue, action.value);
      const items = { ...state.items, [action.key]: updatedValue };
      const history = [
        action.key,
        ...state.history.filter((key) => key !== action.key),
      ];
      return { ...state, items, history };
    }
    case ACTION_DELETE_ENTRY: {
      if (!hasEntry(state, action.key)) {
        return state;
      }
      const items = { ...state.items };
      delete items[action.key];
      const history = state.history.filter((key) => key !== action.key);
      return { ...state, items, history };
    }
    case ACTION_INVALIDATE_CACHE:
      return { ...initialState, maxSize: state.maxSize };
    default:
      return state;
  }
}
