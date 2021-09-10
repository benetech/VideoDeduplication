import { useServer } from "../../../server-api/context";
import { useDeleteEntity } from "../../common/react-query/useEntityMutation";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";

/**
 * Get a callback to delete task.
 * @return {function}
 */
export default function useDeleteTask() {
  const server = useServer();
  const mutation = useDeleteEntity({
    mutationFn: (task) => server.tasks.delete(task),
    checkFilters: checkTaskFilters,
    makeComparator: makeTaskComparator,
    updateKeys: ["tasks"],
  });

  return mutation.mutateAsync;
}
