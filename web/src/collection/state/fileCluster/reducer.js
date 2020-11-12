import extendEntityMap from "../helpers/extendEntityMap";
import extendEntityList from "../helpers/extendEntityList";
import initialState from "./initialState";
import {
  ACTION_FETCH_FILE_CLUSTER,
  ACTION_FETCH_FILE_CLUSTER_FAILURE,
  ACTION_FETCH_FILE_CLUSTER_SUCCESS,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS,
} from "./actions";

export default function fileClusterReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_UPDATE_FILE_CLUSTER_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        matches: [],
        files: {},
        loading: true,
        error: false,
        total: undefined,
      };
    case ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS:
      return {
        ...state,
        total: action.total,
        matches: [...action.matches],
        files: extendEntityMap({}, action.files),
        error: false,
        loading: false,
      };
    case ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE:
      return {
        ...state,
        matches: [],
        files: {},
        total: undefined,
        error: true,
        loading: false,
      };
    case ACTION_FETCH_FILE_CLUSTER:
      return {
        ...state,
        error: false,
        loading: true,
      };
    case ACTION_FETCH_FILE_CLUSTER_SUCCESS:
      return {
        ...state,
        total: action.total,
        matches: extendEntityList(state.matches, action.matches),
        files: extendEntityMap(state.files, action.files),
        error: false,
        loading: false,
      };
    case ACTION_FETCH_FILE_CLUSTER_FAILURE:
      return {
        ...state,
        error: true,
        loading: false,
      };
    default:
      return state;
  }
}
