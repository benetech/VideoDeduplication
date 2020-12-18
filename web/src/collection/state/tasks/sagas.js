import { takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_TASK_SLICE,
  ACTION_UPDATE_TASKS_PARAMS,
  fetchTaskSliceFailure,
  fetchTaskSliceSuccess,
} from "./actions";
import fetchEntitiesSaga from "../fetchEntities/fetchEntitiesSaga";

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
  // Handle every slice fetch.
  yield takeLatest(
    [ACTION_FETCH_TASK_SLICE, ACTION_UPDATE_TASKS_PARAMS],
    fetchTaskSliceSaga,
    server,
    selectTasks
  );
}
