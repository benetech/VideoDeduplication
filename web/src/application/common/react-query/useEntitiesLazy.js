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
 * @return {{results: InfiniteQueryAPI, query: unknown}} files query.
 */
export default function useEntitiesLazy(queryKey, fetchFn) {
  const query = useInfiniteQuery(queryKey, fetchFn, {
    keepPreviousData: true,
    getNextPageParam: (lastPage) => {
      if (lastPage == null) {
        return 0;
      }
      const nextOffset = lastPage.request.offset + lastPage.items.length;
      if (nextOffset < lastPage.total) {
        return nextOffset;
      }
    },
  });

  const pages = useMemo(
    () => (query.data?.pages || []).map((page) => page.items),
    [query.data?.pages]
  );

  let total = 0;
  if (query.data?.pages?.length > 0) {
    total = query.data.pages[pages.length - 1].total;
  }

  const isLoading = query.isFetchingNextPage;
  const canLoad = query.hasNextPage && !isLoading;

  return {
    results: {
      pages,
      total,
      error: query.error,
      isLoading,
      isError: query.isError,
      hasNextPage: !!query.hasNextPage,
      fetchNextPage: query.fetchNextPage,
      refetch: query.fetchNextPage,
      canLoad,
    },
    query,
  };
}
