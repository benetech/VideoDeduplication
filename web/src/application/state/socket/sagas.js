import { eventChannel } from "redux-saga";
import {
  ACTION_SUBSCRIBE_FOR_TASK_LOGS,
  ACTION_UNSUBSCRIBE_FROM_TASK_LOGS,
  appendTaskLogs,
} from "../tasks/logs/actions";
import { call, fork, put, select, take } from "redux-saga/effects";
import { selectTaskLogs } from "../root/selectors";
import { ACTION_SOCKET_CONNECTED, socketConnected } from "./actions";
import { deleteTask, updateTask } from "../tasks/common/actions";

/**
 * Create event channel to handle socket messages.
 * @param {Socket} socket
 */
function makeTaskChannel(socket) {
  return eventChannel((emit) => {
    // Handle task updates...
    socket.on("task-update", (task) => emit(updateTask(task)));

    // Handle task deletions...
    socket.on("task-delete", (taskId) => emit(deleteTask(taskId)));

    // Handle task logs updates...
    socket.on("logs-update", ({ taskId, data }) =>
      emit(appendTaskLogs({ id: taskId, logs: [data], more: true }))
    );

    // Handle socket connection...
    socket.on("connect", () => emit(socketConnected()));

    // Close socket when channel is closed
    return () => socket.close();
  });
}

/**
 * Handle task log subscriptions
 * @param {Socket} socket
 */
function* logSubscriptionSaga(socket) {
  while (true) {
    const action = yield take([
      ACTION_SUBSCRIBE_FOR_TASK_LOGS,
      ACTION_UNSUBSCRIBE_FROM_TASK_LOGS,
      ACTION_SOCKET_CONNECTED,
    ]);
    try {
      if (action.type === ACTION_SUBSCRIBE_FOR_TASK_LOGS) {
        socket.subscribeForLogs(action.id);
      } else if (action.type === ACTION_UNSUBSCRIBE_FROM_TASK_LOGS) {
        socket.unsubscribeFromLogs(action.id);
      } else if (action.type === ACTION_SOCKET_CONNECTED) {
        const taskLogs = yield select(selectTaskLogs);
        if (taskLogs.taskId != null && taskLogs.logs != null) {
          const offset = taskLogs.logs
            .map((entry) => entry.length)
            .reduce((a, b) => a + b, 0);
          socket.subscribeForLogs(taskLogs.taskId, offset);
        }
      }
    } catch (error) {
      console.error("Log subscription error", action, error);
    }
  }
}

/**
 * Handle socket messages.
 * @param {Server} server backend API Client
 */
function* handleMessagesSaga(server) {
  try {
    const socket = server.openMessageChannel();
    const channel = yield call(makeTaskChannel, socket);
    yield fork(logSubscriptionSaga, socket);

    while (true) {
      const action = yield take(channel);
      yield put(action);
    }
  } catch (error) {
    console.error("Task-updates saga error", error);
  }
}

/**
 * Initialize socket-related sagas.
 * @param {Server} server backend API Client
 */
export default function* socketRootSaga(server) {
  // yield fork(handleMessagesSaga, server);
}
