/**
 * Collect queries data in the store.
 * @param queryClient
 * @param {Map} store
 * @param {any[]} keys
 */
export default function collectQueriesData(queryClient, store, keys) {
  keys.forEach((keyFilter) => {
    queryClient
      .getQueriesData(keyFilter)
      .forEach(([exactKey, data]) => store.set(exactKey, data));
  });
}
