import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_FILES,
  ACTION_UPDATE_FILE_MATCH_FILTERS,
  ACTION_UPDATE_FILTERS,
  fetchFilesFailure,
  fetchFilesSuccess,
  updateFileMatchFiltersFailure,
  updateFileMatchFiltersSuccess,
  updateFiltersFailure,
  updateFiltersSuccess,
} from "./actions";
import { selectColl, selectFileMatches } from "./selectors";

function* fetchFileMatchesSaga(server, action) {
  try {
    // Determine current query params
    const { limit, offset, filters } = yield select(selectFileMatches);

    // Send request to the server
    const resp = yield call([server, server.fetchFileMatches], {
      limit,
      offset,
      id: action.fileId,
    });

    // Handle error
    if (resp.failure) {
      console.error("Fetch file matches error", resp.error);
      yield put(updateFileMatchFiltersFailure(resp.error));
      return;
    }

    // Update state
    const { total, matches } = resp.data;
    yield put(updateFileMatchFiltersSuccess(matches, total));
  } catch (error) {
    console.error(error);
    yield put(updateFileMatchFiltersFailure(error));
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
  console.log("coll root saga");
  yield takeLatest(
    [ACTION_UPDATE_FILTERS, ACTION_FETCH_FILES],
    fetchFilesSaga,
    server
  );
  yield takeLatest(
    ACTION_UPDATE_FILE_MATCH_FILTERS,
    fetchFileMatchesSaga,
    server
  );
}
