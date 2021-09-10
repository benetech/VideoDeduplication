import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/react-query/useEntitiesLazy";

/**
 * Use lazy templates query.
 * @param {TemplateFilters} filters query filters
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {InfiniteQueryAPI} files query.
 */
export default function useTemplatesLazy(filters, options = {}) {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy(
    ["templates", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.templates.list({ filters, limit, offset })
  );

  return results;
}
