import { v4 as uuid } from "uuid";

export const ACTION_QUERY_TASKS = "taskQuery.QUERY_TASKS";

/**
 * @typedef {{
 *   type: string,
 *   params: TaskFilters,
 *   request: string|undefined|null,
 *   tasks: TaskEntity[]|undefined,
 *   total: number|undefined,
 * }} TaskQueryAction
 */

/**
 * Start task query.
 * @param {TaskFilters} params
 * @return {TaskQueryAction}
 */
export function queryTasks(params) {
  return { type: ACTION_QUERY_TASKS, params, request: uuid() };
}

export const ACTION_UPDATE_TASK_QUERY = "taskQuery.UPDATE_TASK_QUERY";

/**
 * Update tasks query
 * @param {TaskFilters} params
 * @param {TaskEntity[]} tasks
 * @param {number} total
 * @param {string|null} request
 * @return {TaskQueryAction}
 */
export function updateTaskQuery({ params, tasks, total, request = null }) {
  return { type: ACTION_UPDATE_TASK_QUERY, params, tasks, total, request };
}

export const ACTION_TASK_QUERY_FAILED = "taskQuery.TASK_QUERY_FAILED";

/**
 * Mark task query as failed.
 *
 * @param {TaskFilters} params
 * @param {string} request
 * @return {TaskQueryAction}
 */
export function taskQueryFailed(params, request) {
  return { type: ACTION_TASK_QUERY_FAILED, params, request };
}

export const ACTION_ACQUIRE_TASK_QUERY = "taskQuery.ACQUIRE_TASK_QUERY";

/**
 * Acquire (increment reference count of) task query.
 * @param {TaskFilters} params
 * @return {TaskQueryAction}
 */
export function acquireTaskQuery(params) {
  return { type: ACTION_ACQUIRE_TASK_QUERY, params };
}

export const ACTION_RELEASE_TASK_QUERY = "taskQuery.RELEASE_TASK_QUERY";

/**
 * Release task query.
 *
 * @param {TaskFilters} params
 * @return {TaskQueryAction}
 */
export function releaseTaskQuery(params) {
  return { type: ACTION_RELEASE_TASK_QUERY, params };
}
