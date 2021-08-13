export const ACTION_CACHE_TASK = "taskCache.CACHE_TASK";

/**
 * Cache a single task.
 * @param {TaskEntity} task
 * @return {{task, type: string}}
 */
export function cacheTask(task) {
  return { task, type: ACTION_CACHE_TASK };
}
