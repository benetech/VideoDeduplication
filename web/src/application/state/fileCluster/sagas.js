import {
  ACTION_FETCH_FILE_CLUSTER_SLICE,
  ACTION_UPDATE_FILE_CLUSTER_PARAMS,
  fetchFileClusterSliceFailure,
  fetchFileClusterSliceSuccess,
} from "./actions";
import { takeLatest } from "redux-saga/effects";
import fetchEntitiesSaga from "../fetchEntities/fetchEntitiesSaga";

/**
 * Fetch the next slice of file cluster items.
 * @param {Server} server
 * @param {function} selectFileCluster
 * @param {{type}} action
 */
function* fetchFileClusterSliceSaga(server, selectFileCluster, action) {
  // Handling update-params is required to cancel the previous request.
  if (action.type === ACTION_UPDATE_FILE_CLUSTER_PARAMS) {
    return;
  }
  yield* fetchEntitiesSaga({
    requestResource: [server.files, server.files.cluster],
    stateSelector: selectFileCluster,
    success: fetchFileClusterSliceSuccess,
    failure: fetchFileClusterSliceFailure,
    resourceName: "matches",
  });
}

/**
 * Initialize collection-related sagas...
 */
export default function* fileClusterRootSaga(server, selectFileCluster) {
  // Handle every slice fetch.
  yield takeLatest(
    [ACTION_FETCH_FILE_CLUSTER_SLICE, ACTION_UPDATE_FILE_CLUSTER_PARAMS],
    fetchFileClusterSliceSaga,
    server,
    selectFileCluster
  );
}
