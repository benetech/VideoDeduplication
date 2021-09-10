import useFileClusterLazy from "./useFileClusterLazy";
import useLoadAll from "../../common/react-query/useLoadAll";
import { useMemo } from "react";

/**
 * @typedef {{
 *   files: FileEntity[],
 *   matches: MatchEntity[],
 *   error: Error,
 *   resumeLoading: function,
 *   hasMore: boolean,
 *   progress: number,
 * }} EagerFileClusterQuery
 */

/**
 * Fetch entire file cluster satisfying the query params.
 * @param {number} fileId the corresponding file id
 * @param {ClusterFilters} filters The matches query params.
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {EagerFileClusterQuery}
 */
export default function useFileClusterAll(fileId, filters, options) {
  if (fileId == null) {
    throw new Error("File id cannot be null.");
  }

  const query = useFileClusterLazy(fileId, filters, options);
  const results = useLoadAll(query, {
    collectItems: () => [],
  });

  const files = useMemo(() => {
    const fileIndex = {};
    for (const page of query.pages) {
      for (const file of page.files) {
        fileIndex[file.id] = file;
      }
    }
    return fileIndex;
  }, [query.pages]);
  const matches = useMemo(
    () => [].concat(...query.pages.map((page) => page.matches)),
    [query.pages]
  );

  return { ...results, files, matches };
}
