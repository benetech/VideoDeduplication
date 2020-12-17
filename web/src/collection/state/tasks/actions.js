export const ACTION_UPDATE_TASKS_PARAMS = "coll.UPDATE_TASKS_PARAMS";

export function updateTasksParams(params, preserveItems = false) {
  return { params, preserveItems, type: ACTION_UPDATE_TASKS_PARAMS };
}

export const ACTION_FETCH_TASK_SLICE = "coll.FETCH_TASK_SLICE";

export function fetchTaskSlice() {
  return { type: ACTION_FETCH_TASK_SLICE };
}

export const ACTION_FETCH_TASK_SLICE_SUCCESS = "coll.FETCH_TASK_SLICE_SUCCESS";

export function fetchTaskSliceSuccess({ data, params }) {
  return { data, params, type: ACTION_FETCH_TASK_SLICE_SUCCESS };
}

export const ACTION_FETCH_TASK_SLICE_FAILURE = "coll.FETCH_TASK_SLICE_FAILURE";

export function fetchTaskSliceFailure({ error, params }) {
  return { error, params, type: ACTION_FETCH_TASK_SLICE_FAILURE };
}

export const ACTION_DELETE_TASK = "coll.DELETE_TASK";

export function deleteTask(id) {
  return { id, type: ACTION_DELETE_TASK };
}

export const ACTION_UPDATE_TASK = "coll.UPDATE_TASK";

export function updateTask(task) {
  return { task, type: ACTION_UPDATE_TASK };
}
