import initialState from "./initialState";
import {
  ACTION_FETCH_FILE_CLUSTER_SLICE,
  ACTION_FETCH_FILE_CLUSTER_SLICE_FAILURE,
  ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS,
  ACTION_UPDATE_FILE_CLUSTER_PARAMS,
} from "./actions";
import makeEntityReducer from "../fetchEntities/makeEntityReducer";
import extendEntityMap from "../helpers/extendEntityMap";

const defaultReducer = makeEntityReducer({
  updateParams: ACTION_UPDATE_FILE_CLUSTER_PARAMS,
  fetchSlice: ACTION_FETCH_FILE_CLUSTER_SLICE,
  fetchSliceSuccess: ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS,
  fetchSliceFailure: ACTION_FETCH_FILE_CLUSTER_SLICE_FAILURE,
  initialState: initialState,
  resourceName: "matches",
});

export default function fileClusterReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS:
      return {
        ...defaultReducer(state, action),
        files: extendEntityMap(state.files, action.files),
      };
    default:
      return defaultReducer(state, action);
  }
}
