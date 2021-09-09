import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/react-query/useEntitiesLazy";

/**
 * @typedef {{
 *   pages: TemplateExclusionEntity[][],
 *   total: number,
 *   error: object,
 *   isLoading: boolean,
 *   isError: boolean,
 *   hasNextPage: boolean,
 *   fetchNextPage: function,
 *   refetch: function,
 *   canLoad: boolean,
 * }} FileExclusionsQueryAPI
 */

/**
 * Use lazy file exclusions query.
 * @param {TemplateExclusionFilters} filters query filters
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {FileExclusionsQueryAPI} file exclusions query.
 */
export default function useExclusionsLazy(filters, options = {}) {
  const server = useServer();
  const { limit = 1000 } = options;

  const { results } = useEntitiesLazy(
    ["template-file-exclusions", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.templateExclusions.list({ filters, offset, limit })
  );

  return results;
}
