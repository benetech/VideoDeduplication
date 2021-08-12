import initialState, { makeQuery } from "./initialState";
import {
  ACTION_INVALIDATE_CACHE,
  ACTION_QUERY_FAILED,
  ACTION_QUERY_ITEMS,
  ACTION_RELEASE_QUERY,
  ACTION_UPDATE_QUERY,
  ACTION_USE_QUERY,
} from "./actions";
import popQuery from "./helpers/popQuery";
import extendEntityList from "../helpers/extendEntityList";
import lodash from "lodash";
import { idComparator } from "../../../lib/helpers/comparators";
import addQueryEntity from "./helpers/addQueryEntity";
import deleteQueryEntity from "./helpers/deleteQueryEntity";
import updateQueryEntity from "./helpers/updateQueryEntity";

/**
 * Create new cached query with incremented reference counter.
 * @param {CachedQuery} query
 * @return CachedQuery
 */
function incRefs(query) {
  return {
    ...query,
    references: query.references + 1,
    validUntil: undefined,
    requestError: false,
  };
}

/**
 * Create new cached query, with decremented reference counter.
 * @param {CachedQuery} query original query.
 * @param {number} truncateSize max item count in non-referenced cache entry.
 * @param {number} ttl time to live of the non-referenced cache entry.
 * @return CachedQuery
 */
function decRefs(query, truncateSize, ttl) {
  if (query.references === 0) {
    return query;
  }

  const references = query.references - 1;
  const truncate = references === 0 && query.items.length > truncateSize;
  const items = truncate ? query.items.slice(0, truncateSize) : query.items;
  const validUntil = references === 0 ? Date.now() + ttl : undefined;
  return {
    ...query,
    references,
    items,
    validUntil,
  };
}

/**
 * Apply query updates.
 * @param {CachedQuery} query query to be updated
 * @param {{items:Entity[], total:number, data}} updates query updates
 * @param {number} truncateSize max number of items for non-referenced queries
 * @return {CachedQuery} updated query
 */
function applyUpdates(query, updates, truncateSize) {
  let items = extendEntityList(query.items, updates.items);
  if (query.references === 0 && items.length > truncateSize) {
    items.splice(truncateSize);
  }
  return {
    ...query,
    items,
    total: updates.total,
    data: updates.data,
    request: null,
    requestError: false,
  };
}

/**
 * Evict extra queries from the cache.
 * @param {CachedQuery[]} queries array of existing queries in chronological order
 * @param {number} maxQueries maximal number of queries
 * @return {CachedQuery[]}
 */
function evict(queries, maxQueries) {
  const result = [];

  // Max orphans count is maxQueries - number of non-orphaned queries.
  // We simply check how many slots are available for orphans if non-orphaned
  // queries are retained.
  let maxOrphansCount = maxQueries;
  for (let query of queries) {
    if (query.references > 0) {
      maxOrphansCount -= 1;
    }
    if (maxOrphansCount === 0) {
      break;
    }
  }

  let orphansCount = 0;
  for (let query of queries) {
    if (query.references > 0) {
      result.push(query);
      continue;
    }
    if (query.validUntil > Date.now() && orphansCount < maxOrphansCount) {
      result.push(query);
      orphansCount += 1;
    }
  }
  return result;
}

/**
 * Replace query using the transform function while not changing queries order.
 * @param {CachedQuery[]} queries arrays of queries containing wanted query to be replaced.
 * @param {Object} params wanted query parameters
 * @param {function} replace function to replace previous query
 * @return {CachedQuery[]}
 */
function replaceQueryFunc(queries, params, replace) {
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    if (lodash.isEqual(query.params, params)) {
      const replaced = replace(query);
      return queries
        .slice(0, i)
        .concat([replaced], queries.slice(i + 1, queries.length));
    }
  }
  return queries;
}

/**
 * Truncate query to zero length and set loading to false.
 * @param {CachedQuery} query cached query
 * @return {CachedQuery}
 */
function invalidateQuery(query) {
  return {
    ...query,
    items: [],
    total: undefined,
    request: null,
    requestError: false,
  };
}

/**
 * Set active request on query.
 * @param {CachedQuery} query
 * @param {string} request
 * @return {CachedQuery}
 */
function beginRequest(query, request) {
  return {
    ...query,
    request: request,
    requestError: false,
  };
}

/**
 * Mark current request as failed.
 * @param {CachedQuery} query
 * @return {CachedQuery}
 */
function failRequest(query) {
  return {
    ...query,
    request: null,
    requestError: true,
  };
}

/**
 * Query cache reducer.
 * @param {QueryCache} state query cache state
 * @param {{params}} action query cache action
 * @return {QueryCache}
 */
export default function queryCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_USE_QUERY: {
      const [query, others] = popQuery(state.queries, action.params, makeQuery);
      const updated = incRefs(query);
      const updatedQueries = evict([updated, ...others], state.maxQueries);
      return { ...state, queries: updatedQueries };
    }
    case ACTION_RELEASE_QUERY: {
      const afterUpdate = replaceQueryFunc(
        state.queries,
        action.params,
        (query) => decRefs(query, state.truncateSize, state.ttl)
      );
      const afterEvict = evict(afterUpdate, state.maxQueries);
      return { ...state, queries: afterEvict };
    }
    case ACTION_UPDATE_QUERY: {
      const [query, others] = popQuery(state.queries, action.params);
      // Dismiss inactive requests
      if (action.request !== query?.request) {
        return state;
      }
      if (query != null) {
        const updated = applyUpdates(query, action, state.truncateSize);
        const updatedQueries = evict([updated, ...others], state.maxQueries);
        return { ...state, queries: updatedQueries };
      }
      return state;
    }
    case ACTION_QUERY_ITEMS: {
      const [query, others] = popQuery(state.queries, action.params, makeQuery);
      // Dismiss new requests until previous is finished
      if (query.request != null) {
        return state;
      }
      const updated = beginRequest(query, action.request);
      const updatedQueries = evict([updated, ...others], state.maxQueries);
      return { ...state, queries: updatedQueries };
    }
    case ACTION_QUERY_FAILED: {
      const [query, others] = popQuery(state.queries, action.params);
      // Dismiss inactive requests
      if (action.request !== query?.request) {
        return state;
      }
      const updated = failRequest(query);
      const updatedQueries = evict([updated, ...others], state.maxQueries);
      return { ...state, queries: updatedQueries };
    }
    case ACTION_INVALIDATE_CACHE: {
      const nonOrphaned = state.queries.filter((query) => query.references > 0);
      const invalidated = nonOrphaned.map(invalidateQuery);
      return { ...state, queries: invalidated };
    }
    default:
      return state;
  }
}

/**
 * Add entity to appropriate cached queries.
 * @param {QueryCache} cache
 * @param {Entity} entity
 * @param {function} checkFilters
 * @param {function} comparatorFactory function that takes query params and returns sort comparator
 */
export function addEntity(
  cache,
  entity,
  checkFilters,
  comparatorFactory = () => idComparator
) {
  // Flag required to prevent unnecessary updates
  let changed = false;

  // Add entity to appropriate queries
  const updatedQueries = cache.queries.map((query) => {
    if (!checkFilters(query, entity)) {
      return query;
    }
    changed = true;
    const comparator = comparatorFactory(query.params);
    return addQueryEntity(query, entity, checkFilters, comparator);
  });

  // Don't change cache if queries are the same
  if (!changed) {
    return cache;
  }

  return {
    ...cache,
    queries: updatedQueries,
  };
}

/**
 * Remove entity from cached queries.
 * @param {QueryCache} cache
 * @param {Entity} entity
 * @return {QueryCache}
 */
export function deleteEntity(cache, entity) {
  // Flag to prevent unnecessary updates
  let changed = false;

  const updatedQueries = cache.queries.map((query) => {
    const updatedQuery = deleteQueryEntity(query, entity);
    changed ||= updatedQuery !== query;
    return updatedQuery;
  });

  // Don't update cache if queries are the same
  if (!changed) {
    return cache;
  }

  return {
    ...cache,
    queries: updatedQueries,
  };
}

/**
 * Update entity in cached queries.
 * @param {QueryCache} cache
 * @param {Entity} entity
 * @param {function} updater takes current entity and produce the updated entity
 * @param {function} checkFilters check if the updated entity satisfies query params
 * @param {function} comparatorFactory create sort comparator from query params
 * @return {QueryCache}
 */
function updatedEntity(
  cache,
  entity,
  updater,
  checkFilters,
  comparatorFactory = () => idComparator
) {
  // Flag to prevent unnecessary cache updates
  let changed = false;

  // Update entity in cached queries
  const updatedQueries = cache.queries.map((query) => {
    const comparator = comparatorFactory(query.params);
    const updatedQuery = updateQueryEntity(
      query,
      entity,
      updater,
      checkFilters,
      comparator
    );
    changed ||= updatedQuery !== query;
    return updatedQuery;
  });

  // Don't update cache if queries are the same
  if (!changed) {
    return cache;
  }

  return {
    ...cache,
    queries: updatedQueries,
  };
}
