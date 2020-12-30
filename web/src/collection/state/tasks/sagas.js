import { call, fork, put, take, takeLatest } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import {
  ACTION_FETCH_TASK_SLICE,
  ACTION_UPDATE_TASKS_PARAMS,
  deleteTask,
  fetchTaskSliceFailure,
  fetchTaskSliceSuccess,
  updateTask,
} from "./actions";
import fetchEntitiesSaga from "../fetchEntities/fetchEntitiesSaga";

function makeTaskChannel(server) {
  return eventChannel((emit) => {
    const socket = server.openMessageChannel();

    // Handle task updates...
    socket.on("task-update", (task) => emit(updateTask(task)));

    // Handle task deletions...
    socket.on("task-delete", (taskId) => emit(deleteTask(taskId)));

    // Close socket when channel is closed
    return () => socket.close();
  });
}

function* handleTaskUpdatesSaga(server) {
  try {
    const channel = yield call(makeTaskChannel, server);

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
