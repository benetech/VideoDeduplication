import {
  ACTION_FETCH_FILE_MATCHES_SLICE,
  ACTION_FETCH_FILE_MATCHES_SLICE_FAILURE,
  ACTION_FETCH_FILE_MATCHES_SLICE_SUCCESS,
  ACTION_UPDATE_FILE_MATCHES_PARAMS,
} from "./actions";
import initialState from "./initialState";
import makeEntityReducer from "../fetchEntities/makeEntityReducer";

const fileMatchesReducer = makeEntityReducer({
  updateParams: ACTION_UPDATE_FILE_MATCHES_PARAMS,
  fetchSlice: ACTION_FETCH_FILE_MATCHES_SLICE,
  fetchSliceSuccess: ACTION_FETCH_FILE_MATCHES_SLICE_SUCCESS,
  fetchSliceFailure: ACTION_FETCH_FILE_MATCHES_SLICE_FAILURE,
  initialState: initialState,
  resourceName: "matches",
});

export default fileMatchesReducer;
