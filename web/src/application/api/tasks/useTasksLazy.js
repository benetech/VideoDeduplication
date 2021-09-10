import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/react-query/useEntitiesLazy";

/**
 * Use lazy tasks query.
 * @param {TaskFilters} filters query filters
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {InfiniteQueryAPI} task query.
 */
export default function useTasksLazy(filters, options = {}) {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy(
    ["tasks", filters, limit],
    ({ pageParam: offset = 0 }) => server.tasks.list({ filters, limit, offset })
  );

  return results;
}
