import useLoadAll from "../../common/useLoadAll";
import useExclusionsLazy from "./useExclusionsLazy";
import { EagerQueryAPI, QueryOptions } from "../../common/model";
import {
  TemplateExclusion,
  TemplateExclusionFilters,
} from "../../../model/Template";

/**
 * Results of `useFileMatchesAll` hook.
 */
export type UseExclusionsAllResults = EagerQueryAPI & {
  exclusions: TemplateExclusion[];
};

/**
 * Fetch all template exclusions.
 */
export default function useExclusionsAll(
  filters: TemplateExclusionFilters = {},
  options: QueryOptions = {}
): UseExclusionsAllResults {
  const query = useExclusionsLazy(filters, options);
  const results = useLoadAll(query);

  return { ...results, exclusions: results.items };
}
