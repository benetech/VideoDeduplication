import { fork } from "redux-saga/effects";
import { selectFileCluster, selectFileMatches } from "./selectors";
import fileMatchRootSaga from "../fileMatches/sagas";
import fileClusterRootSaga from "../fileCluster/sagas";
import filesQuerySaga from "../files/queries/sagas";
import templatesRootSaga from "../templates/root/sagas";
import tasksRootSaga from "../tasks/root/sagas";
import socketRootSaga from "../socket/sagas";

/**
 * Initialize collection-related sagas...
 * @param {Server} server
 */
export default function* appRootSaga(server) {
  yield fork(fileMatchRootSaga, server, selectFileMatches);
  yield fork(fileClusterRootSaga, server, selectFileCluster);
  yield fork(filesQuerySaga, server);
  yield fork(templatesRootSaga, server);
  yield fork(tasksRootSaga, server);
  yield fork(socketRootSaga, server);
}
