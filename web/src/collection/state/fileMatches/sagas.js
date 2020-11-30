import { takeLatest } from "redux-saga/effects";
import {
  ACTION_FETCH_FILE_MATCHES_SLICE,
  ACTION_UPDATE_FILE_MATCHES_PARAMS,
  fetchFileMatchesSliceFailure,
  fetchFileMatchesSliceSuccess,
} from "./actions";
import fetchEntitiesSaga from "../fetchEntities/fetchEntitiesSaga";

/**
 * Fetch the next slice of file matches.
 */
function* fetchFileMatchesSliceSaga(server, selectFileMatches, action) {
  // Handling update-params is required to cancel the previous request.
  if (action.type === ACTION_UPDATE_FILE_MATCHES_PARAMS) {
    return;
  }
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
    [ACTION_FETCH_FILE_MATCHES_SLICE, ACTION_UPDATE_FILE_MATCHES_PARAMS],
    fetchFileMatchesSliceSaga,
    server,
    selectFileMatches
  );
}
