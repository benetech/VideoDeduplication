import { useServer } from "../../../server-api/context";
import { useCreateEntity } from "../../common/useEntityMutation";
import checkTaskFilters from "./helpers/checkTaskFilters";
import makeTaskComparator from "./helpers/makeTaskComparator";
import { Task, TaskFilters, TaskRequest } from "../../../model/Task";
import { CreateFn } from "../../common/model";
import { ListResults } from "../../../server-api/ServerAPI";

/**
 * Get callback to run tasks.
 */
export default function useRunTask(): CreateFn<Task, TaskRequest> {
  const server = useServer();
  const mutation = useCreateEntity<
    Task,
    TaskFilters,
    ListResults<Task, TaskFilters>,
    TaskRequest
  >({
    createFn: (request) => server.tasks.create(request),
    checkFilters: checkTaskFilters,
    makeComparator: makeTaskComparator,
    updateKeys: ["tasks"],
  });

  return mutation.mutateAsync;
}
