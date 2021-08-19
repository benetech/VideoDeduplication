export const ACTION_SUBSCRIBE_FOR_TASK_LOGS = "taskLogs.SUBSCRIBE";

export function subscribeForTaskLogs(id) {
  return { id, type: ACTION_SUBSCRIBE_FOR_TASK_LOGS };
}

export const ACTION_UNSUBSCRIBE_FROM_TASK_LOGS =
  "coll.UNSUBSCRIBE_FROM_TASK_LOGS";

export function unsubscribeFromTaskLogs(id) {
  return { id, type: ACTION_UNSUBSCRIBE_FROM_TASK_LOGS };
}

export const ACTION_APPEND_TASK_LOGS = "taskLogs.APPEND_LOGS";

export function appendTaskLogs({ id, logs, more = true }) {
  return { id, logs, more, type: ACTION_APPEND_TASK_LOGS };
}

export const ACTION_SET_TASK_LOGS = "taskLogs.SET_LOGS";

export function setTaskLogs({ id, logs, more = false }) {
  return { id, logs, more, type: ACTION_SET_TASK_LOGS };
}
