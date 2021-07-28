export const ACTION_USE_QUERY = "queryCache.USE_QUERY";

/**
 * Increment query reference counter.
 *
 * If query with the given params doesn't exist, it will be created with
 * empty items list and reference count = 1.
 *
 * @param {Object} params query parameters
 * @return {{type: string, params}}
 */
export function useQuery(params) {
  return { type: ACTION_USE_QUERY, params };
}

export const ACTION_RELEASE_QUERY = "queryCache.RELEASE_QUERY";

/**
 * Decrement query reference counter.
 *
 * If reference counter becomes 0, query items are truncated to the minimal
 * length and `validUntil` attribute is initialized.
 *
 * @param {Object} params query parameters
 * @return {{type: string, params:Object}}
 */
export function releaseQuery(params) {
  return { type: ACTION_RELEASE_QUERY, params };
}

export const ACTION_UPDATE_QUERY = "queryCache.UPDATE_QUERY";

/**
 * Add new items to the query.
 * @param {Object} params query parameters
 * @param {[{id}]} items fetched entities
 * @param {number} total total amount of items corresponding to the query
 * @param {*} data any additional data associated with the query
 * @return {{total:number, type: string, params: Object, items: [{id}], data}}
 */
export function updateQuery(params, items, total, data) {
  return { type: ACTION_UPDATE_QUERY, params, items, total, data };
}
