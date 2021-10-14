import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { TemplateMatch, TemplateMatchFilters } from "../../../model/Template";

/**
 * Use lazy objects query.
 */
export default function useObjectsLazy(
  filters: TemplateMatchFilters = {},
  options: QueryOptions = {}
): LazyQueryResults<TemplateMatch[]> {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy<TemplateMatch, TemplateMatchFilters>(
    ["template_matches", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.templateMatches.list({ filters, limit, offset })
  );

  return results;
}
