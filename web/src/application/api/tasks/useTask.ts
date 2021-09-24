import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";
import { EntityQueryResults } from "../../common/model";
import { Task } from "../../../model/Task";

/**
 * API to fetch single task.
 */
export type UseTaskResults = EntityQueryResults & {
  task?: Task;
};

/**
 * Fetch a single task by id.
 */
export default function useTask(id: Task["id"]): UseTaskResults {
  const server = useServer();
  const query = useQuery<Task, Error>(["task", id], () => server.tasks.get(id));
  return {
    task: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}
