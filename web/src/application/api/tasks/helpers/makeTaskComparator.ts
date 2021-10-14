import { Task } from "../../../../model/Task";
import { ComparatorFn } from "../../../../lib/helpers/comparators";

/**
 * Compare tasks by submission time.
 */
export function taskComparator(first: Task, second: Task): number {
  return second.submissionTime.getTime() - first.submissionTime.getTime();
}

/**
 * Create task sort comparator from query request.
 */
export default function makeTaskComparator(): ComparatorFn<Task> {
  return taskComparator;
}
