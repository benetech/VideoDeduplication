import useLoadAll from "../../common/useLoadAll";
import useObjectsLazy from "./useObjectsLazy";
import { EagerQueryAPI, QueryOptions } from "../../common/model";
import { TemplateMatch, TemplateMatchFilters } from "../../../model/Template";

/**
 * Results of `useObjectsAll` hook.
 */
export type UseObjectsAllResults = EagerQueryAPI & {
  objects: TemplateMatch[];
};

/**
 * Use eager objects query.
 */
export default function useObjectsAll(
  filters: TemplateMatchFilters = {},
  options: QueryOptions = {}
): UseObjectsAllResults {
  const query = useObjectsLazy(filters, options);
  const results = useLoadAll(query);

  return { ...results, objects: results.items };
}
