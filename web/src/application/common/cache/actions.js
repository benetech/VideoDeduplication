export const ACTION_CACHE_VALUE = "cache.CACHE_VALUE";

/**
 * Cache single value.
 * @param {string} key cache key
 * @param {*} value entity to be cached.
 * @returns {{type: string, key: string, value}}
 */
export function cacheValue(key, value) {
  return { type: ACTION_CACHE_VALUE, key, value };
}

export const ACTION_UPDATE_VALUE = "cache.UPDATE_VALUE";

/**
 * Update cached entity.
 *
 * If key is not in the cache, the action will be ignored.
 * If value is cached, it will be deep-merged with the update value.
 *
 * @param {string} key cache key
 * @param {*} value entity to be cached.
 * @returns {{type: string, key: string, value}}
 */
export function updateValue(key, value) {
  return { type: ACTION_UPDATE_VALUE, key, value };
}

export const ACTION_DELETE_ENTRY = "cache.DELETE_ENTRY";

/**
 * Delete cache entry by key.
 *
 * If key is not in the cache, the action will be ignored.
 *
 * @param {string} key
 * @returns {{type: string, key: string}}
 */
export function deleteEntry(key) {
  return { type: ACTION_DELETE_ENTRY, key };
}
