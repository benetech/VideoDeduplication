import initialState, { makeQuery } from "./initialState";
import {
  ACTION_RELEASE_QUERY,
  ACTION_UPDATE_QUERY,
  ACTION_USE_QUERY,
} from "./actions";
import popQuery from "./helpers/popQuery";
import extendEntityList from "../helpers/extendEntityList";
import lodash from "lodash";

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
      if (query != null) {
        const updated = applyUpdates(query, action, state.truncateSize);
        const updatedQueries = evict([updated, ...others]);
        return { ...state, queries: updatedQueries };
      }
      return state;
    }
    default:
      return state;
  }
}
