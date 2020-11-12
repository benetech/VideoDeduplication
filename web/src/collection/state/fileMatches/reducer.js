import initialState from "./initialState";
import {
  ACTION_FETCH_FILE_MATCHES,
  ACTION_FETCH_FILE_MATCHES_FAILURE,
  ACTION_FETCH_FILE_MATCHES_SUCCESS,
  ACTION_UPDATE_FILE_MATCH_FILTERS,
  ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE,
  ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS,
} from "./actions";
import extendEntityList from "../helpers/extendEntityList";

export default function fileMatchesReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_UPDATE_FILE_MATCH_FILTERS:
      return {
        ...state,
        fileId: action.fileId,
        filters: { ...state.filters, ...action.filters },
        matches: [],
        loading: true,
        error: false,
        total: undefined,
      };
    case ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS:
      return {
        ...state,
        total: action.total,
        matches: [...action.matches],
        error: false,
        loading: false,
      };
    case ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE:
      return {
        ...state,
        matches: [],
        total: undefined,
        error: true,
        loading: false,
      };
    case ACTION_FETCH_FILE_MATCHES:
      return {
        ...state,
        error: false,
        loading: true,
      };
    case ACTION_FETCH_FILE_MATCHES_SUCCESS:
      return {
        ...state,
        total: action.total,
        matches: extendEntityList(state.matches, action.matches),
        error: false,
        loading: false,
      };
    case ACTION_FETCH_FILE_MATCHES_FAILURE:
      return {
        ...state,
        error: true,
        loading: false,
      };
    default:
      return state;
  }
}
