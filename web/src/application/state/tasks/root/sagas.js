import { takeEvery } from "redux-saga/effects";
import { loadTasksSaga } from "../queries/sagas";
import { ACTION_QUERY_TASKS } from "../queries/actions";

/**
 * Tasks root saga.
 * @param {Server} server server API
 */
export default function* tasksRootSaga(server) {
  yield takeEvery(ACTION_QUERY_TASKS, loadTasksSaga, server);
}
