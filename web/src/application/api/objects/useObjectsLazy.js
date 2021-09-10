import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/react-query/useEntitiesLazy";

/**
 * Use lazy file matches query.
 * @param {TemplateMatchFilters} filters query filters
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {InfiniteQueryAPI} files query.
 */
export default function useObjectsLazy(filters, options = {}) {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy(
    ["template_matches", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.templateMatches.list({ filters, limit, offset })
  );

  return results;
}
