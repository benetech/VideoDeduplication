import useLoadAll from "../../common/useLoadAll";
import { EagerQueryAPI, QueryOptions } from "../../common/model";
import { Repository, RepositoryFilters } from "../../../model/VideoFile";
import useRepositoriesLazy from "./useRepositoriesLazy";

export type UseRepositoriesAllResult = EagerQueryAPI & {
  repositories: Repository[];
};

/**
 * Use eager repositories query.
 */
export default function useRepositoriesAll(
  filters: RepositoryFilters = {},
  options: QueryOptions = {}
): UseRepositoriesAllResult {
  const query = useRepositoriesLazy(filters, options);
  const results = useLoadAll(query);

  return { ...results, repositories: results.items };
}
