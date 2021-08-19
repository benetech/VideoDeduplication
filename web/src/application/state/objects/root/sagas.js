import { takeEvery } from "redux-saga/effects";
import { ACTION_QUERY_OBJECTS } from "../queries/actions";
import { loadObjectsSaga } from "../queries/sagas";

/**
 * Template-matches (objects) root saga.
 * @param {Server} server server API
 */
export default function* objectsRootSaga(server) {
  yield takeEvery(ACTION_QUERY_OBJECTS, loadObjectsSaga, server);
}
