import { useMemo } from "react";
import { useServer } from "../../../server-api/context";
import { useInfiniteQuery } from "react-query";

/**
 * @typedef {{
 *   pages: FileMatchEntity[][],
 *   total: number,
 *   error: object,
 *   isLoading: boolean,
 *   isError: boolean,
 *   hasNextPage: boolean,
 *   fetchNextPage: function,
 *   refetch: function,
 *   canLoad: boolean,
 * }} FileMatchesQueryAPI
 */

/**
 * Use lazy file matches query.
 * @param fileId {number} file id
 * @param {FileMatchFilters} filters query filters
 * @param {{
 *   limit: number,
 *   fields: string[],
 * }} options additional options
 * @return {FileMatchesQueryAPI} files query.
 */
export default function useFileMatchesLazy(fileId, filters, options = {}) {
  const server = useServer();
  const { limit = 100, fields = ["meta", "exif", "scenes"] } = options;
  const query = useInfiniteQuery(
    ["file-matches", fileId, { filters, limit, fields }],
    ({ pageParam: offset = 0 }) =>
      server.files.matches({ fileId, filters, limit, offset, fields }),
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage) => {
        const nextOffset = lastPage.offset + lastPage.matches.length;
        if (nextOffset < lastPage.total) {
          return nextOffset;
        }
      },
    }
  );

  const pages = useMemo(
    () => (query.data?.pages || []).map((page) => page.matches),
    [query.data?.pages]
  );

  let total = 0;
  if (query.data?.pages?.length > 0) {
    total = query.data.pages[pages.length - 1].total;
  }

  return {
    pages,
    total,
    error: query.error,
    isLoading: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.fetchNextPage,
    canLoad: query.hasNextPage && !query.isLoading,
  };
}
