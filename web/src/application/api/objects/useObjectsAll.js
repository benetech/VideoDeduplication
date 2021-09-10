import useLoadAll from "../../common/react-query/useLoadAll";
import useObjectsLazy from "./useObjectsLazy";

/**
 * @typedef {{
 *   objects: ObjectEntity[],
 *   error: Error,
 *   resumeLoading: function,
 *   hasMore: boolean,
 *   progress: number,
 * }} EagerObjectQuery
 */

/**
 * Use lazy file matches query.
 * @param {TemplateMatchFilters} filters query filters
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {EagerObjectQuery} files query.
 */
export default function useObjectsAll(filters, options) {
  const query = useObjectsLazy(filters, options);
  const results = useLoadAll(query);

  return { ...results, objects: results.items };
}
