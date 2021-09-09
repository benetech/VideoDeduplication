import useFileMatchesLazy from "./useFileMatchesLazy";
import useLoadAll from "../../common/react-query/useLoadAll";

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
  const results = useLoadAll(query);

  return { ...results, matches: results.items };
}
