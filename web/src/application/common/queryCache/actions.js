import { v4 as uuid } from "uuid";

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
 * @param {boolean} loaded
 * @return {{total:number, type: string, params: Object, items: [{id}], data}}
 */
export function updateQuery({ params, items, total, data, request = null }) {
  return { type: ACTION_UPDATE_QUERY, params, items, total, data, request };
}

export const ACTION_INVALIDATE_CACHE = "queryCache.INVALIDATE_CACHE";

/**
 * Invalidate query cache.
 *
 * Orphaned queries will be dismissed.
 * Non-orphaned queries will be truncated to zero.
 *
 * @return {{type: string}}
 */
export function invalidateCache() {
  return { type: ACTION_INVALIDATE_CACHE };
}

export const ACTION_QUERY_ITEMS = "queryCache.QUERY_ITEMS";

/**
 * Mark query as being loaded.
 * @param {{}} params
 * @param {string|undefined} request request id
 * @return {{request: string, type: string, params}}
 */
export function queryItems(params, request) {
  return { type: ACTION_QUERY_ITEMS, params, request: request || uuid() };
}

export const ACTION_QUERY_FAILED = "queryCache.QUERY_FAILED";

/**
 * Mark query request as failed.
 * @param {Object} params query parameters
 * @param {string} request query request id.
 * @return {{request: string, type: string, params: Object}}
 */
export function queryFailed(params, request) {
  return { type: ACTION_QUERY_FAILED, params, request };
}
