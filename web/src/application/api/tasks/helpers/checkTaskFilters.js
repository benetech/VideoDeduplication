/**
 * Check if task satisfies query filters.
 * @param {{
 *   filters: TaskFilters
 * }} request
 * @param {TaskEntity} task
 * @return {boolean}
 */
export default function checkTaskFilters(request, task) {
  const { filters } = request;
  if (filters?.status?.length > 0 && !filters.status.includes(task.status)) {
    return false;
  }
  return (
    !(filters?.type?.length > 0) || filters.type.includes(task.request.type)
  );
}
