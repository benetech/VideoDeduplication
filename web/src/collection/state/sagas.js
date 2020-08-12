import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_FILES,
  ACTION_UPDATE_FILTERS,
  fetchFilesFailure,
  fetchFilesSuccess,
  updateFiltersFailure,
  updateFiltersSuccess,
} from "./actions";
import { selectColl } from "./selectors";

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
    // Determine current page, pageSize and filters from the state
    const { pageSize, files: loadedFiles, filters } = yield select(selectColl);
    const page = Math.floor(loadedFiles / pageSize);

    // Send request to the server
    const resp = yield call([server, server.fetchFiles], {
      page,
      pageSize,
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
}
