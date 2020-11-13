import { takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_FILE_MATCHES_SLICE,
  fetchFileMatchesSliceFailure,
  fetchFileMatchesSliceSuccess,
} from "./actions";
import fetchEntitiesSaga from "../fetchEntities/fetchEntitiesSaga";

/**
 * Fetch the next slice of file matches.
 */
function* fetchFileMatchesSliceSaga(server, selectFileMatches) {
  yield* fetchEntitiesSaga({
    requestResource: [server, server.fetchFileMatches],
    stateSelector: selectFileMatches,
    success: fetchFileMatchesSliceSuccess,
    failure: fetchFileMatchesSliceFailure,
    resourceName: "matches",
  });
}

/**
 * Initialize collection-related sagas...
 */
export default function* fileMatchRootSaga(server, selectFileMatches) {
  // Handle every slice fetch.
  yield takeLatest(
    ACTION_FETCH_FILE_MATCHES_SLICE,
    fetchFileMatchesSliceSaga,
    server,
    selectFileMatches
  );
}
