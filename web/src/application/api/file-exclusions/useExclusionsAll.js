import useLoadAll from "../../common/react-query/useLoadAll";
import useExclusionsLazy from "./useExclusionsLazy";

/**
 * @typedef {{
 *   exclusions: TemplateExclusionEntity[],
 *   error: Error,
 *   resumeLoading: function,
 *   hasMore: boolean,
 *   progress: number,
 * }} EagerExclusionsQuery
 */

/**
 * Fetch all template exclusions.
 * @param {TemplateExclusionFilters} filters query filters
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {EagerExclusionsQuery}
 */
export default function useExclusionsAll(filters, options) {
  const query = useExclusionsLazy(filters, options);
  const results = useLoadAll(query);

  return { ...results, exclusions: results.items };
}
