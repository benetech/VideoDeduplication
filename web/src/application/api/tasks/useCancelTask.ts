import { useServer } from "../../../server-api/context";
import { usePredefinedUpdateEntity } from "../../common/useEntityMutation";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";
import { Task, TaskFilters } from "../../../model/Task";
import { PredefinedUpdateFn } from "../../common/model";

/**
 * Get a callback to cancel task.
 */
export default function useCancelTask(): PredefinedUpdateFn<Task> {
  const server = useServer();
  const mutation = usePredefinedUpdateEntity<Task, TaskFilters>({
    updateFn: (task) => server.tasks.cancel(task),
    checkFilters: checkTaskFilters,
    makeComparator: makeTaskComparator,
    updateKeys: ["tasks"],
  });

  return mutation.mutateAsync;
}
