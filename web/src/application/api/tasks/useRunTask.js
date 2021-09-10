import { useServer } from "../../../server-api/context";
import { useCreateEntity } from "../../common/react-query/useEntityMutation";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";

/**
 * Get callback to run tasks.
 * @return {(function(*): Promise<TaskEntity>)}
 */
export default function useRunTask() {
  const server = useServer();
  const mutation = useCreateEntity({
    mutationFn: (request) => server.tasks.create(request),
    checkFilters: checkTaskFilters,
    makeComparator: makeTaskComparator,
    updateKeys: ["tasks"],
    optimistic: false,
  });

  return mutation.mutateAsync;
}
