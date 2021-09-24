import { Task, TaskFilters } from "../../../../model/Task";
import { ListRequest } from "../../../../server-api/ServerAPI";

/**
 * Check if task satisfies query filters.
 */
export default function checkTaskFilters(
  request: ListRequest<TaskFilters>,
  task: Task
): boolean {
  const { filters } = request;
  if (
    filters?.status != null &&
    filters?.status?.length > 0 &&
    !filters.status.includes(task.status)
  ) {
    return false;
  }
  return (
    filters.type == null ||
    (filters?.type?.length || 0) === 0 ||
    filters.type.includes(task.request.type)
  );
}
