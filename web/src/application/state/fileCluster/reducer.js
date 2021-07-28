import initialState from "./initialState";
import {
  ACTION_FETCH_FILE_CLUSTER_SLICE,
  ACTION_FETCH_FILE_CLUSTER_SLICE_FAILURE,
  ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS,
  ACTION_UPDATE_FILE_CLUSTER_PARAMS,
} from "./actions";
import makeEntityReducer from "../fetchEntities/makeEntityReducer";
import extendEntityMap from "../../common/helpers/extendEntityMap";

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
    case ACTION_UPDATE_FILE_CLUSTER_PARAMS:
      return {
        ...defaultReducer(state, action),
        files: {},
      };
    case ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS: {
      const newState = defaultReducer(state, action);
      if (state.loading && !newState.loading) {
        return {
          ...defaultReducer(state, action),
          files: extendEntityMap(state.files, action.data.files),
        };
      }
      return newState;
    }
    default:
      return defaultReducer(state, action);
  }
}
