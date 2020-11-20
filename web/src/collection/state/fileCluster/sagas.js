import {
  ACTION_FETCH_FILE_CLUSTER_SLICE,
  fetchFileClusterSliceFailure,
  fetchFileClusterSliceSuccess,
} from "./actions";
import { takeLatest } from "redux-saga/effects";
import fetchEntitiesSaga from "../fetchEntities/fetchEntitiesSaga";

/**
 * Fetch the next slice of file cluster items.
 */
function* fetchFileClusterSliceSaga(server, selectFileCluster) {
  yield* fetchEntitiesSaga({
    requestResource: [server, server.fetchFileCluster],
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
    ACTION_FETCH_FILE_CLUSTER_SLICE,
    fetchFileClusterSliceSaga,
    server,
    selectFileCluster
  );
}
