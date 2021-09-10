/**
 * Compare tasks by submission time.
 * @param {TaskEntity} first
 * @param {TaskEntity} second
 * @returns {number}
 */
export function taskComparator(first, second) {
  return second.submissionTime - first.submissionTime;
}

/**
 * Create task sort comparator from query request.
 * @returns {(function(TaskEntity, TaskEntity):boolean)}
 */
export default function makeTaskComparator() {
  return taskComparator;
}
