import { useEffect, useMemo } from "react";

/**
 * @typedef {{
 *   pages: Entity[][],
 *   total: number,
 *   error: object,
 *   isLoading: boolean,
 *   isError: boolean,
 *   hasNextPage: boolean,
 *   fetchNextPage: function,
 *   refetch: function,
 *   canLoad: boolean,
 * }} LazyQueryResults
 *
 * @typedef {{
 *   items: Entity[],
 *   error: Error,
 *   total: number,
 *   resumeLoading: function,
 *   hasMore: boolean,
 *   progress: number,
 *   done: boolean,
 * }} EagerQueryResults
 */

/**
 * Fetch all items.
 * @param {LazyQueryResults} results current paged query results
 * @param {{
 *   collectItems: function
 * }} options
 * @return {EagerQueryResults}
 */
export default function useLoadAll(results, options = {}) {
  const { collectItems = (results) => [].concat(...results.pages) } = options;

  const items = useMemo(() => collectItems(results), [results.pages]);

  useEffect(() => {
    if (results.canLoad && !results.isError) {
      results.fetchNextPage();
    }
  }, [results.canLoad, results.isError, results.fetchNextPage]);

  return {
    items,
    total: results.total,
    error: results.error,
    progress: results.total > 0 ? items.length / results.total : 0,
    hasMore: results.hasNextPage,
    resumeLoading: results.fetchNextPage,
    done: !results.hasNextPage,
  };
}