import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { Contributor, ContributorFilters } from "../../../model/VideoFile";

export default function useContributorsLazy(
  filters: ContributorFilters,
  options: QueryOptions = {}
): LazyQueryResults<Contributor[]> {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy<Contributor, ContributorFilters>(
    ["contributors", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.contributors.list({ filters, limit, offset })
  );

  return results;
}
