import {
  ACTION_FETCH_FILE_CLUSTER,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS,
  fetchFileClusterFailure,
  fetchFileClusterSuccess,
  updateFileClusterFiltersFailure,
  updateFileClusterFiltersSuccess,
} from "./actions";
import { call, put, select, takeLatest } from "redux-saga/effects";

function* updateFileClusterFiltersSaga(server, selectFileCluster) {
  yield* fetchFileClusterSaga(
    server,
    selectFileCluster,
    updateFileClusterFiltersSuccess,
    updateFileClusterFiltersFailure
  );
}

function* fetchFileClusterPageSaga(server, selectFileCluster) {
  yield* fetchFileClusterSaga(
    server,
    selectFileCluster,
    fetchFileClusterSuccess,
    fetchFileClusterFailure
  );
}

function* fetchFileClusterSaga(server, selectFileCluster, success, failure) {
  try {
    console.log("HANDLING");
    // Determine current query params
    const { limit, filters, matches: current } = yield select(
      selectFileCluster
    );

    // Send request to the server
    const resp = yield call([server, server.fetchFileCluster], {
      limit,
      offset: current.length,
      id: filters.fileId,
      fields: filters.fields,
      filters,
    });

    // Handle error
    if (resp.failure) {
      console.error("Fetch file matches error", resp.error);
      yield put(failure(resp.error));
      return;
    }

    // Update state
    const { total, matches, files } = resp.data;
    yield put(success(matches, files, total));
  } catch (error) {
    console.error(error);
    yield put(failure(error));
  }
}

/**
 * Initialize collection-related sagas...
 */
export default function* fileClusterRootSaga(server, selectFileCluster) {
  // Handle every filters update.
  yield takeLatest(
    ACTION_UPDATE_FILE_CLUSTER_FILTERS,
    updateFileClusterFiltersSaga,
    server,
    selectFileCluster
  );

  // Handle every slice fetch.
  yield takeLatest(
    ACTION_FETCH_FILE_CLUSTER,
    fetchFileClusterPageSaga,
    server,
    selectFileCluster
  );
}
