import useLoadAll from "../../common/useLoadAll";
import { EagerQueryAPI, QueryOptions } from "../../common/model";
import { Contributor, ContributorFilters } from "../../../model/VideoFile";
import useContributorsLazy from "./useContributorsLazy";

export type UseContributorsAllResult = EagerQueryAPI & {
  contributors: Contributor[];
};

/**
 * Use eager contributors query.
 */
export default function useContributorsAll(
  filters: ContributorFilters = {},
  options: QueryOptions = {}
): UseContributorsAllResult {
  const query = useContributorsLazy(filters, options);
  const results = useLoadAll(query);

  return { ...results, contributors: results.items };
}
