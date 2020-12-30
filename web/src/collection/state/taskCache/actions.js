export const ACTION_CACHE_TASK = "coll.CACHE_TASK";

export function cacheTask(task) {
  return { task, type: ACTION_CACHE_TASK };
}
