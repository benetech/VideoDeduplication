import { call, fork, put, take, takeLatest } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import {
  ACTION_FETCH_TASK_SLICE,
  ACTION_UPDATE_TASKS_PARAMS,
  fetchTaskSliceFailure,
  fetchTaskSliceSuccess,
  updateTask,
} from "./actions";
import fetchEntitiesSaga from "../fetchEntities/fetchEntitiesSaga";
import io from "socket.io-client";
import { SocketEvent, SocketNamespace, socketPath } from "./socket";
import Transform from "../../../server-api/Server/Transform";

function makeTaskChannel() {
  return eventChannel((emit) => {
    const transformer = new Transform();
    const socket = io(SocketNamespace.TASKS, {
      path: socketPath,
    });
    socket.on("connect", () => console.log("Connected!"));
    socket.on("disconnect", () => console.log("Disconnected!"));
    socket.on(SocketEvent.TASK_UPDATED, (data) => {
      emit(updateTask(transformer.task(data)));
    });
    return () => {
      socket.close();
    };
  });
}

function* handleTaskUpdatesSaga() {
  try {
    const channel = yield call(makeTaskChannel);

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
  yield fork(handleTaskUpdatesSaga);

  // Handle every slice fetch.
  yield takeLatest(
    [ACTION_FETCH_TASK_SLICE, ACTION_UPDATE_TASKS_PARAMS],
    fetchTaskSliceSaga,
    server,
    selectTasks
  );
}
