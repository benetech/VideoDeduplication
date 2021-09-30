import useLoadAll from "../../common/useLoadAll";
import useTemplatesLazy from "./useTemplatesLazy";
import { EagerQueryAPI, QueryOptions } from "../../common/model";
import { Template, TemplateFilters } from "../../../model/Template";

export type UseTemplatesAllResult = EagerQueryAPI & {
  templates: Template[];
};

/**
 * Use eager templates query.
 */
export default function useTemplatesAll(
  filters: TemplateFilters = {},
  options: QueryOptions = {}
): UseTemplatesAllResult {
  const query = useTemplatesLazy(filters, options);
  const results = useLoadAll(query);

  return { ...results, templates: results.items };
}
