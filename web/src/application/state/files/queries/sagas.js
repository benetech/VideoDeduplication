import { call, put, select, takeEvery } from "redux-saga/effects";
import {
  ACTION_QUERY_FILES,
  filesQueryFailed,
  updateFilesQuery,
} from "./actions";
import { selectFilesQuery } from "../../root/selectors";

/**
 * Do load files from the backend.
 * @param {Server} server server API
 * @param {{type, request, params}} action query files action
 */
function* loadFilesSaga(server, action) {
  const query = yield select(selectFilesQuery(action.params));

  // Skip dismissed requests
  if (query?.request !== action.request) {
    return;
  }

  try {
    // Send request to the server
    const { counts, files } = yield call([server.files, server.files.list], {
      limit: 96,
      offset: query.items.length,
      filters: action.params,
    });

    // Update query
    yield put(
      updateFilesQuery({
        params: action.params,
        files,
        counts,
        request: action.request,
      })
    );
  } catch (error) {
    console.error("loadFilesSaga failed", error);
    yield put(filesQueryFailed(action.params, action.request));
  }
}

/**
 * Files query cache sage.
 * @param {Server} server server API
 */
export default function* filesQuerySaga(server) {
  yield takeEvery(ACTION_QUERY_FILES, loadFilesSaga, server);
}
