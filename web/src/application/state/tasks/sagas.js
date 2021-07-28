import { call, fork, put, select, take, takeLatest } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import {
  ACTION_FETCH_TASK_SLICE,
  ACTION_SOCKET_CONNECTED,
  ACTION_UPDATE_TASKS_PARAMS,
  deleteTask,
  fetchTaskSliceFailure,
  fetchTaskSliceSuccess,
  socketConnected,
  updateTask,
} from "./actions";
import fetchEntitiesSaga from "../fetchEntities/fetchEntitiesSaga";
import {
  ACTION_SUBSCRIBE_FOR_TASK_LOGS,
  ACTION_UNSUBSCRIBE_FROM_TASK_LOGS,
  appendTaskLogs,
} from "../taskLogs/actions";
import { selectTaskLogs } from "../root/selectors";

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

function* handleTaskUpdatesSaga(server) {
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
 * Fetch the next slice of background tasks collection.
 */
function* fetchTaskSliceSaga(server, selectTasks, action) {
  // Handling update-params is required to cancel the previous request.
  if (action.type === ACTION_UPDATE_TASKS_PARAMS) {
    return;
  }
  yield* fetchEntitiesSaga({
    requestResource: [server, server.fetchTasks],
    stateSelector: selectTasks,
    success: fetchTaskSliceSuccess,
    failure: fetchTaskSliceFailure,
    resourceName: "tasks",
  });
}

/**
 * Initialize task-related sagas...
 */
export default function* taskRootSaga(server, selectTasks) {
  // Handle task updates
  yield fork(handleTaskUpdatesSaga, server);

  // Handle every slice fetch.
  yield takeLatest(
    [ACTION_FETCH_TASK_SLICE, ACTION_UPDATE_TASKS_PARAMS],
    fetchTaskSliceSaga,
    server,
    selectTasks
  );
}
