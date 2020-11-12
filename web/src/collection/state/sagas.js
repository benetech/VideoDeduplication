import { fork, call, put, select, takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_FILE_CLUSTER,
  ACTION_FETCH_FILES,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS,
  ACTION_UPDATE_FILTERS,
  fetchFileClusterFailure,
  fetchFileClusterSuccess,
  fetchFilesFailure,
  fetchFilesSuccess,
  updateFileClusterFiltersFailure,
  updateFileClusterFiltersSuccess,
  updateFiltersFailure,
  updateFiltersSuccess,
} from "./actions";
import { selectColl, selectFileCluster, selectFileMatches } from "./selectors";
import fileMatchRootSaga from "./fileMatches/sagas";

function* updateFileClusterFiltersSaga(server, action) {
  yield* fetchFileClusterSaga(
    server,
    action,
    updateFileClusterFiltersSuccess,
    updateFileClusterFiltersFailure
  );
}

function* fetchFileClusterPageSaga(server, action) {
  yield* fetchFileClusterSaga(
    server,
    action,
    fetchFileClusterSuccess,
    fetchFileClusterFailure
  );
}

function* fetchFileClusterSaga(server, action, success, failure) {
  try {
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

function resolveReportActions(fetchAction) {
  switch (fetchAction.type) {
    case ACTION_UPDATE_FILTERS:
      return [updateFiltersSuccess, updateFiltersFailure];
    case ACTION_FETCH_FILES:
      return [fetchFilesSuccess, fetchFilesFailure];
    default:
      throw new Error(`Unsupported fetch action type: ${fetchAction.type}`);
  }
}

/**
 * Fetch next page of files.
 */
function* fetchFilesSaga(server, action) {
  // Determine report-result actions
  const [success, failure] = resolveReportActions(action);

  try {
    // Determine current limit, offset and filters from the state
    const { limit, files: loadedFiles, filters } = yield select(selectColl);
    const offset = loadedFiles.length;

    // Send request to the server
    const resp = yield call([server, server.fetchFiles], {
      limit,
      offset,
      filters,
    });

    // Handle error
    if (resp.failure) {
      console.error("Fetch files error", resp.error);
      yield put(failure(resp.error));
      return;
    }

    // Update state
    const { counts, files } = resp.data;
    yield put(success(files, counts));
  } catch (error) {
    console.error(error);
    yield put(failure(error));
  }
}

/**
 * Initialize collection-related sagas...
 */
export default function* collRootSaga(server) {
  yield fork(fileMatchRootSaga, server, selectFileMatches);

  yield takeLatest(
    [ACTION_UPDATE_FILTERS, ACTION_FETCH_FILES],
    fetchFilesSaga,
    server
  );
  yield takeLatest(
    ACTION_UPDATE_FILE_CLUSTER_FILTERS,
    updateFileClusterFiltersSaga,
    server
  );
  yield takeLatest(ACTION_FETCH_FILE_CLUSTER, fetchFileClusterPageSaga, server);
}
