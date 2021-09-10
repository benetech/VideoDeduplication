import { useServer } from "../../../server-api/context";
import { useUpdateEntity } from "../../common/react-query/useEntityMutation";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";

/**
 * Get a callback to cancel task.
 * @return {function}
 */
export default function useCancelTask() {
  const server = useServer();
  const mutation = useUpdateEntity({
    mutationFn: (task) => server.tasks.cancel(task),
    checkFilters: checkTaskFilters,
    makeComparator: makeTaskComparator,
    updateKeys: ["tasks"],
    optimistic: false,
  });

  return mutation.mutateAsync;
}
