import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { Repository, RepositoryFilters } from "../../../model/VideoFile";

export default function useRepositoriesLazy(
  filters: RepositoryFilters,
  options: QueryOptions = {}
): LazyQueryResults<Repository[]> {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy<Repository, RepositoryFilters>(
    ["repositories", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.repositories.list({ filters, limit, offset })
  );

  return results;
}
