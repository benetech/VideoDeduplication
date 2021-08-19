export const ACTION_UPDATE_TASK = "tasks.UPDATE_TASK";

/**
 * @typedef {{
 *   type: string,
 *   task: TaskEntity|undefined|null,
 *   id: string|number|undefined,
 * }} TaskAction
 */

/**
 * Update or create task.
 *
 * Task will be created if missing.
 *
 * @param {TaskEntity} task
 * @return {TaskAction}
 */
export function updateTask(task) {
  return { task, type: ACTION_UPDATE_TASK };
}

export const ACTION_DELETE_TASK = "tasks.DELETE_TASK";

/**
 * Delete task.
 * @param {string|number} id
 * @return {TaskAction}
 */
export function deleteTask(id) {
  return { type: ACTION_DELETE_TASK, id };
}
