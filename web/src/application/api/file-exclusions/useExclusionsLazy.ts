import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import {
  TemplateExclusion,
  TemplateExclusionFilters,
} from "../../../model/Template";

/**
 * Use lazy file exclusions query.
 */
export default function useExclusionsLazy(
  filters: TemplateExclusionFilters = {},
  options: QueryOptions = {}
): LazyQueryResults<TemplateExclusion[]> {
  const server = useServer();
  const { limit = 1000 } = options;

  const { results } = useEntitiesLazy<
    TemplateExclusion,
    TemplateExclusionFilters
  >(["template-file-exclusions", filters, limit], ({ pageParam: offset = 0 }) =>
    server.templateExclusions.list({ filters, offset, limit })
  );

  return results;
}
