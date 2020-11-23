import {
  ACTION_BLUR_FILES,
  ACTION_CHANGE_FILE_LIST_VIEW,
  ACTION_FETCH_FILES,
  ACTION_FETCH_FILES_FAILURE,
  ACTION_FETCH_FILES_SUCCESS,
  ACTION_UPDATE_FILTERS,
  ACTION_UPDATE_FILTERS_FAILURE,
  ACTION_UPDATE_FILTERS_SUCCESS,
} from "./actions";
import extendEntityList from "../helpers/extendEntityList";
import FileListType from "./FileListType";
import initialState from "./initialState";

export default function fileListReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        files: [],
        loading: true,
        neverLoaded: false,
      };
    case ACTION_UPDATE_FILTERS_SUCCESS:
      return {
        ...state,
        files: [...action.files],
        counts: { ...action.counts },
        error: false,
        loading: false,
      };
    case ACTION_UPDATE_FILTERS_FAILURE:
      return {
        ...state,
        files: [],
        error: true,
        loading: false,
      };
    case ACTION_FETCH_FILES:
      return {
        ...state,
        loading: true,
        neverLoaded: false,
      };
    case ACTION_FETCH_FILES_SUCCESS:
      return {
        ...state,
        error: false,
        files: extendEntityList(state.files, action.files),
        counts: { ...action.counts },
        loading: false,
      };
    case ACTION_FETCH_FILES_FAILURE:
      return {
        ...state,
        error: true,
        loading: false,
      };
    case ACTION_CHANGE_FILE_LIST_VIEW:
      if (FileListType.values().indexOf(action.view) === -1) {
        throw new Error(`Unknown file list type: ${action.view}`);
      }
      return {
        ...state,
        fileListType: action.view,
      };
    case ACTION_BLUR_FILES:
      return {
        ...state,
        blur: action.blur,
      };
    default:
      return state;
  }
}
