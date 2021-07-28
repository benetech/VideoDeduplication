import lodash from "lodash";

/**
 * Remove query with the given params from the array and return found query and
 * remaining elements of the array.
 *
 * If query is not found, it will be created with the `factory` function and
 * returned along with the original array.
 *
 * @param {CachedQuery[]} queries array of cached queries
 * @param {Object} params query parameters
 * @param {function} factory factory function to produce missing query
 * @return {[CachedQuery, CachedQuery[]]}
 */
export default function popQuery(queries, params, factory = () => undefined) {
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    if (lodash.isEqual(query.params, params)) {
      const remaining = queries
        .slice(0, i)
        .concat(queries.slice(i + 1, queries.length));
      return [query, remaining];
    }
  }
  return [factory(params), queries];
}
