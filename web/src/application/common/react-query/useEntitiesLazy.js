import { useMemo } from "react";
import { useInfiniteQuery } from "react-query";

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
 * }} InfiniteQueryAPI
 */

/**
 * Use lazy infinite query.
 * @param queryKey query key
 * @param {function} fetchFn function to fetch entities
 * @param {{
 *   makePages: function,
 *   getTotal: function,
 *   getOffset: function,
 * }} options
 * @return {{results: InfiniteQueryAPI, query: unknown}} files query.
 */
export default function useEntitiesLazy(queryKey, fetchFn, options = {}) {
  const {
    makePages = (query) => (query.data?.pages || []).map((page) => page.items),
    getTotal = (query) => {
      if (query.data?.pages?.length > 0) {
        return query.data.pages[pages.length - 1].total;
      }
      return 0;
    },
    getOffset = (lastPage) => lastPage.request.offset + lastPage.items.length,
  } = options;
  const query = useInfiniteQuery(queryKey, fetchFn, {
    keepPreviousData: true,
    getNextPageParam: (lastPage) => {
      if (lastPage == null) {
        return 0;
      }
      const nextOffset = getOffset(lastPage);
      if (nextOffset < lastPage.total) {
        return nextOffset;
      }
    },
  });

  const pages = useMemo(() => makePages(query), [query.data?.pages]);

  const isLoading = query.isFetchingNextPage;
  const canLoad = query.hasNextPage && !isLoading;

  return {
    results: {
      pages,
      total: getTotal(query),
      error: query.error,
      isLoading,
      isError: query.isError,
      hasNextPage: !!query.hasNextPage || query.isLoading,
      fetchNextPage: query.fetchNextPage,
      refetch: query.fetchNextPage,
      canLoad,
    },
    query,
  };
}
