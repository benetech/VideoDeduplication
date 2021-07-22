export const ACTION_CACHE_ENTITY = "entityCache.CACHE_ENTITY";

/**
 * Cache single entity.
 * @param {string} key cache key
 * @param {Object} entity entity to be cached.
 * @returns {{type: string, key: string, entity: Object}}
 */
export function cacheEntity(key, entity) {
  return { type: ACTION_CACHE_ENTITY, key, entity };
}

export const ACTION_UPDATE_ENTITY = "entityCache.UPDATE_ENTITY";

/**
 * Update cached entity.
 *
 * If entity is not cached the action will be ignored.
 * If entity is cached it will be deep-merged with the action.entity value.
 *
 * @param {string} key cache key
 * @param {Object} entity entity to be cached.
 * @returns {{type: string, key: string, entity: Object}}
 */
export function updateEntity(key, entity) {
  return { type: ACTION_UPDATE_ENTITY, key, entity };
}

export const ACTION_DELETE_ENTITY = "entityCache.DELETE_ENTITY";

/**
 * Delete cached entity by key.
 *
 * If entity is not cached, the action will be ignored.
 *
 * @param {string} key
 * @returns {{type: string, key: string}}
 */
export function deleteEntity(key) {
  return { type: ACTION_DELETE_ENTITY, key };
}
