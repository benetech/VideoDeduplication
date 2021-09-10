import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";

/**
 * Fetch task by id.
 * @param {string|number} id
 * @return {{
 *   task: TaskEntity,
 *   error: Error,
 *   isLoading: boolean,
 *   isError: boolean,
 *   isSuccess: boolean,
 *   refetch: function
 * }}
 */
export default function useTask(id) {
  const server = useServer();
  const query = useQuery(["task", id], () => server.tasks.get(id));
  return {
    task: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}
