import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { Template, TemplateFilters } from "../../../model/Template";

/**
 * Use lazy templates query.
 */
export default function useTemplatesLazy(
  filters: TemplateFilters,
  options: QueryOptions = {}
): LazyQueryResults<Template[]> {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy<Template, TemplateFilters>(
    ["templates", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.templates.list({ filters, limit, offset })
  );

  return results;
}
