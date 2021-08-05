import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_FILES,
  ACTION_UPDATE_FILTERS,
  fetchFilesFailure,
  fetchFilesSuccess,
  updateFiltersFailure,
  updateFiltersSuccess,
} from "./actions";

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
 * @param {Server} server
 * @param {function} selectFileList
 * @param {{type}} action
 */
const fetchFilesSaga = function* (server, selectFileList, action) {
  // Determine report-result actions
  const [success, failure] = resolveReportActions(action);

  try {
    // Determine current limit, offset and filters from the state
    const { limit, files: loadedFiles, filters } = yield select(selectFileList);
    const offset = loadedFiles.length;

    // Send request to the server
    const { counts, files } = yield call([server.files, server.files.list], {
      limit,
      offset,
      filters,
    });

    // Update state
    yield put(success(files, counts));
  } catch (error) {
    console.error(error);
    yield put(failure(error));
  }
};

/**
 * Initialize collection-related sagas...
 */
export default function* fileListRootSaga(server, selectFileList) {
  yield takeLatest(
    [ACTION_UPDATE_FILTERS, ACTION_FETCH_FILES],
    fetchFilesSaga,
    server,
    selectFileList
  );
}
