import { all } from "redux-saga/effects";
import { collRootSaga } from "../../collection/state";

/**
 * Application root saga. Initializes all other sagas.
 *
 * @param server
 * @returns {Generator<*, void, *>}
 */
export function* appRootSaga(server) {
  // initialize other sagas...
  yield all([collRootSaga(server)]);
}

export default appRootSaga;
