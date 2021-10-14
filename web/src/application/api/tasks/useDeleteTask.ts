import { useServer } from "../../../server-api/context";
import { useDeleteEntity } from "../../common/useEntityMutation";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";
import { DeleteFn } from "../../common/model";
import { Task, TaskFilters } from "../../../model/Task";

/**
 * Get a callback to delete task.
 */
export default function useDeleteTask(): DeleteFn<Task> {
  const server = useServer();
  const mutation = useDeleteEntity<Task, TaskFilters>({
    deleteFn: (task) => server.tasks.delete(task),
    checkFilters: checkTaskFilters,
    makeComparator: makeTaskComparator,
    updateKeys: ["tasks"],
  });

  return mutation.mutateAsync;
}
