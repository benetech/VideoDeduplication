import { fork } from "redux-saga/effects";
import { selectFileCluster, selectFileMatches, selectTasks } from "./selectors";
import fileMatchRootSaga from "../fileMatches/sagas";
import fileClusterRootSaga from "../fileCluster/sagas";
import taskRootSaga from "../tasks/sagas";
import filesQuerySaga from "../files/queries/sagas";
import templatesQuerySaga from "../templates/root/sagas";

/**
 * Initialize collection-related sagas...
 * @param {Server} server
 */
export default function* appRootSaga(server) {
  yield fork(fileMatchRootSaga, server, selectFileMatches);
  yield fork(fileClusterRootSaga, server, selectFileCluster);
  yield fork(taskRootSaga, server, selectTasks);
  yield fork(filesQuerySaga, server);
  yield fork(templatesQuerySaga, server);
}
