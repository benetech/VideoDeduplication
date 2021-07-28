/**
 * @typedef {{
 *    total: number,
 *    references: number,
 *    validUntil: number,
 *    params,
 *    items: Entity[],
 *    data,
 *  }} CachedQuery
 *
 * @typedef {{
 *    queries: [CachedQuery],
 *    maxQueries: number,
 *    truncateSize: number,
 *    ttl: number,
 * }} QueryCache
 */

/**
 * Initial query cache state.
 * @type QueryCache
 */
import lodash from "lodash";

const initialState = {
  /**
   * Cached queries in chronological order.
   */
  queries: [],
  /**
   * Max number of cached queries
   */
  maxQueries: 50,
  /**
   * Max number of elements in a single query which is currently referenced.
   */
  truncateSize: 50,
  /**
   * Lifespan in milliseconds of the cache entry with 0 references.
   */
  ttl: 10 * 60 * 1000, // 10 minutes by default
};

/**
 * Create a new query with given params and optional initial items.
 * @param  params
 * @param items
 * @return CachedQuery
 */
export function makeQuery(params, items = []) {
  return {
    /**
     * Query parameters. Queries with equal parameters are considered to be the same.
     */
    params: params,
    /**
     * A list of queried items. This list normally will contain only a part
     * of the items satisfying the query params, namely items that was fetched
     * so far.
     */
    items: items || [],
    /**
     * Total number of items in the collection corresponding to this query.
     */
    total: undefined,
    /**
     * Reference counter. A number of components currently using the query.
     */
    references: 0,
    /**
     * Timestamp after which the query could be removed from cache if it is not referenced.
     */
    validUntil: undefined,
    /**
     * Any additional data associated with the query.
     */
    data: undefined,
  };
}

/**
 * Get cached query if exists.
 * @param {QueryCache} cache query cache
 * @param {Object} params query params
 * @return {undefined|CachedQuery}
 */
export function getQuery(cache, params) {
  for (let query of cache.queries) {
    if (lodash.isEqual(query.params, params)) {
      return query;
    }
  }
  return undefined;
}

/**
 * Check if cache contains query with the given params.
 * @param {QueryCache} cache query cache
 * @param {Object} params query params
 * @return {boolean}
 */
export function hasQuery(cache, params) {
  return getQuery(cache, params) != null;
}

export default initialState;
