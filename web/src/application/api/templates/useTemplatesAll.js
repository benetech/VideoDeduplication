import useLoadAll from "../../common/react-query/useLoadAll";
import useTemplatesLazy from "./useTemplatesLazy";

/**
 * @typedef {{
 *   templates: TemplateEntity[],
 *   error: Error,
 *   resumeLoading: function,
 *   hasMore: boolean,
 *   progress: number,
 *   done: boolean,
 * }} EagerTemplatesQuery
 */

/**
 * Use eager templates query.
 * @param {TemplateFilters} filters query filters
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {EagerTemplatesQuery} files query.
 */
export default function useTemplatesAll(filters, options) {
  const query = useTemplatesLazy(filters, options);
  const results = useLoadAll(query);

  return { ...results, templates: results.items };
}
