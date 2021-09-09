import useFileMatchesLazy from "./useFileMatchesLazy";
import { useEffect, useMemo } from "react";

/**
 * @typedef {{
 *   matches: FileMatchEntity[],
 *   error: Error,
 *   resumeLoading: function,
 *   hasMore: boolean,
 *   progress: number,
 * }} EagerFileMatchesQuery
 */

/**
 * Fetch all file matches satisfying the query params.
 * @param {number} fileId the corresponding file id
 * @param {FileMatchFilters} filters The matches query params.
 * @return {EagerFileMatchesQuery}
 */
export default function useFileMatchesAll(fileId, filters) {
  if (fileId == null) {
    throw new Error("File id cannot be null.");
  }

  const query = useFileMatchesLazy(fileId, filters);
  const matches = useMemo(() => [].concat(...query.pages), [query.pages]);

  useEffect(() => {
    if (query.canLoad && !query.isError) {
      query.fetchNextPage();
    }
  }, [query.canLoad, query.isError, query.fetchNextPage]);

  return {
    matches,
    total: query.total,
    error: query.error,
    progress: query.total > 0 ? matches.length / query.total : 0,
    hasMore: query.hasNextPage,
    resumeLoading: query.fetchNextPage,
  };
}
