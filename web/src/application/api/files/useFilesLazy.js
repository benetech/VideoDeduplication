import { useMemo } from "react";
import { MatchCategory } from "../../../prop-types/MatchCategory";
import { useServer } from "../../../server-api/context";
import { useInfiniteQuery } from "react-query";

const defaultCounts = Object.freeze({
  [MatchCategory.all]: 0,
  [MatchCategory.duplicates]: 0,
  [MatchCategory.related]: 0,
  [MatchCategory.unique]: 0,
});

/**
 * @typedef {{
 *   pages: FileEntity[][],
 *   counts: {
 *     all: number,
 *     related: number,
 *     duplicates: number,
 *     unique: number
 *   },
 *   error: object,
 *   isLoading: boolean,
 *   isError: boolean,
 *   hasNextPage: boolean,
 *   fetchNextPage: function,
 *   refetch: function,
 *   canLoad: boolean,
 * }} FileQueryAPI
 */

/**
 * Use lazy files query.
 * @param {FileFilters} filters query filters
 * @param {{
 *   limit: number
 * }} options additional options
 * @return {FileQueryAPI} files query.
 */
export default function useFilesLazy(filters, options = {}) {
  const server = useServer();
  const { limit = 96 } = options;
  const query = useInfiniteQuery(
    ["files", { filters, limit }],
    ({ pageParam: offset = 0 }) =>
      server.files.list({ filters, limit, offset }),
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage) => {
        const nextOffset = lastPage.offset + lastPage.files.length;
        if (nextOffset < lastPage.counts[filters.matches]) {
          return nextOffset;
        }
      },
    }
  );

  const pages = useMemo(
    () => (query.data?.pages || []).map((page) => page.files),
    [query.data?.pages]
  );

  let counts = defaultCounts;
  if (query.data?.pages?.length > 0) {
    counts = query.data.pages[pages.length - 1].counts;
  }
  const isLoading = query.isFetchingNextPage;
  const canLoad = query.hasNextPage && !isLoading;

  return {
    pages,
    counts,
    error: query.error,
    isLoading,
    isError: query.isError,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.fetchNextPage,
    canLoad,
  };
}
