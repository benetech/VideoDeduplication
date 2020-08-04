import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_FILES,
  ACTION_UPDATE_FILTERS,
  fetchFilesFailure,
  fetchFilesSuccess,
} from "./actions";
import { selectColl } from "./selectors";

/**
 * Fetch next page of files.
 */
function* fetchFilesSaga(server) {
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
      yield put(fetchFilesFailure(resp.error));
      return;
    }

    // Update state
    const { counts, files } = resp.data;
    yield put(fetchFilesSuccess(files, counts));
  } catch (error) {
    console.error(error);
    yield put(fetchFilesFailure(error));
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
