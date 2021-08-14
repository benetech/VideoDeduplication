import TaskStatus from "../../../../prop-types/TaskStatus";

/**
 * Check if task is active.
 * @param {TaskEntity} task
 * @return {boolean}
 */
export default function isActiveTask(task) {
  return (
    task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING
  );
}
