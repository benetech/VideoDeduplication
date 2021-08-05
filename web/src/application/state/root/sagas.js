import { fork } from "redux-saga/effects";
import fileListRootSaga from "../files/fileList/sagas";
import {
  selectFileCluster,
  selectFileList,
  selectFileMatches,
  selectTasks,
} from "./selectors";
import fileMatchRootSaga from "../fileMatches/sagas";
import fileClusterRootSaga from "../fileCluster/sagas";
import taskRootSaga from "../tasks/sagas";
import templateRootSaga from "../templates/sagas";
import filesQuerySaga from "../files/queries/sagas";

/**
 * Initialize collection-related sagas...
 */
export default function* appRootSaga(server) {
  yield fork(fileListRootSaga, server, selectFileList);
  yield fork(fileMatchRootSaga, server, selectFileMatches);
  yield fork(fileClusterRootSaga, server, selectFileCluster);
  yield fork(taskRootSaga, server, selectTasks);
  yield fork(templateRootSaga);
  yield fork(filesQuerySaga, server);
}
