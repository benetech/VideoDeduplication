import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { Task, TaskFilters } from "../../../model/Task";

/**
 * Use lazy tasks query.
 */
export default function useTasksLazy(
  filters: TaskFilters = {},
  options: QueryOptions = {}
): LazyQueryResults<Task[]> {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy<Task, TaskFilters>(
    ["tasks", filters, limit],
    ({ pageParam: offset = 0 }) => server.tasks.list({ filters, limit, offset })
  );

  return results;
}
