import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_FILE_MATCHES,
  ACTION_UPDATE_FILE_MATCH_FILTERS,
  fetchFileMatchesFailure,
  fetchFileMatchesSuccess,
  updateFileMatchFiltersFailure,
  updateFileMatchFiltersSuccess,
} from "./actions";

function* updateFileMatchesFiltersSaga(server, selectFileMatches) {
  yield* fetchFileMatchesSaga(
    server,
    selectFileMatches,
    updateFileMatchFiltersSuccess,
    updateFileMatchFiltersFailure
  );
}

function* fetchFileMatchesPageSaga(server, selectFileMatches) {
  yield* fetchFileMatchesSaga(
    server,
    selectFileMatches,
    fetchFileMatchesSuccess,
    fetchFileMatchesFailure
  );
}

function* fetchFileMatchesSaga(server, selectFileMatches, success, failure) {
  try {
    // Determine current query params
    const { limit, filters, matches: current } = yield select(
      selectFileMatches
    );

    // Send request to the server
    const resp = yield call([server, server.fetchFileMatches], {
      limit,
      offset: current.length,
      id: filters.fileId,
      filters,
    });

    // Handle error
    if (resp.failure) {
      console.error("Fetch file matches error", resp.error);
      yield put(failure(resp.error));
      return;
    }

    // Update state
    const { total, matches } = resp.data;
    yield put(success(matches, total));
  } catch (error) {
    console.error(error);
    yield put(failure(error));
  }
}

/**
 * Initialize collection-related sagas...
 */
export default function* fileMatchRootSaga(server, selectFileMatches) {
  // Handle every filters update.
  yield takeLatest(
    ACTION_UPDATE_FILE_MATCH_FILTERS,
    updateFileMatchesFiltersSaga,
    server,
    selectFileMatches
  );

  // Handle every slice fetch.
  yield takeLatest(
    ACTION_FETCH_FILE_MATCHES,
    fetchFileMatchesPageSaga,
    server,
    selectFileMatches
  );
}
