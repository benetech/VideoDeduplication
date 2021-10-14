import { Task, TaskStatus } from "../../../../model/Task";

/**
 * Check if task is active.
 */
export default function isActiveTask(task: Task): boolean {
  return (
    task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING
  );
}
