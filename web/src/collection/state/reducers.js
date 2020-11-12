import {
  ACTION_CHANGE_FILE_LIST_VIEW,
  ACTION_FETCH_FILES,
  ACTION_FETCH_FILES_FAILURE,
  ACTION_FETCH_FILES_SUCCESS,
  ACTION_UPDATE_FILTERS,
  ACTION_UPDATE_FILTERS_FAILURE,
  ACTION_UPDATE_FILTERS_SUCCESS,
} from "./actions";
import { MatchCategory } from "./MatchCategory";
import { FileSort } from "./FileSort";
import FileListType from "./FileListType";
import fileCacheInitialState from "./fileCache/initialState";
import extendEntityList from "./helpers/extendEntityList";
import fileCacheReducer from "./fileCache/reducer";
import { ACTION_CACHE_FILE } from "./fileCache/actions";
import fileMatchesInitialState from "./fileMatches/initialState";
import fileMatchesReducer from "./fileMatches/reducer";
import {
  ACTION_FETCH_FILE_MATCHES,
  ACTION_FETCH_FILE_MATCHES_FAILURE,
  ACTION_FETCH_FILE_MATCHES_SUCCESS,
  ACTION_UPDATE_FILE_MATCH_FILTERS,
  ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE,
  ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS,
} from "./fileMatches/actions";

import fileClusterInitialState from "./fileCluster/initialState";
import fileClusterReducer from "./fileCluster/reducer";
import {
  ACTION_FETCH_FILE_CLUSTER,
  ACTION_FETCH_FILE_CLUSTER_FAILURE,
  ACTION_FETCH_FILE_CLUSTER_SUCCESS,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS,
} from "./fileCluster/actions";

export const initialState = {
  neverLoaded: true,
  error: false,
  loading: false,
  files: [],
  filters: {
    query: "",
    extensions: [],
    length: { lower: null, upper: null },
    date: { lower: null, upper: null },
    audio: null,
    exif: null,
    matches: MatchCategory.all,
    sort: FileSort.date,
  },
  fileListType: FileListType.grid,
  limit: 20,
  counts: {
    all: 0,
    related: 0,
    duplicates: 0,
    unique: 0,
  },
  /**
   * File id=>file LRU cache
   */
  fileCache: fileCacheInitialState,
  /**
   * File cluster
   */
  fileCluster: fileClusterInitialState,
  /**
   * Immediate file matches
   */
  fileMatches: fileMatchesInitialState,
};

/**
 * Default collection filters.
 */
export const defaultFilters = initialState.filters;

export function collRootReducer(state = initialState, action) {
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
    case ACTION_CACHE_FILE:
      return {
        ...state,
        fileCache: fileCacheReducer(state.fileCache, action),
      };
    case ACTION_CHANGE_FILE_LIST_VIEW:
      if (FileListType.values().indexOf(action.view) === -1) {
        throw new Error(`Unknown file list type: ${action.view}`);
      }
      return {
        ...state,
        fileListType: action.view,
      };
    case ACTION_UPDATE_FILE_MATCH_FILTERS:
    case ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS:
    case ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE:
    case ACTION_FETCH_FILE_MATCHES:
    case ACTION_FETCH_FILE_MATCHES_SUCCESS:
    case ACTION_FETCH_FILE_MATCHES_FAILURE:
      return {
        ...state,
        fileMatches: fileMatchesReducer(state.fileMatches, action),
      };
    case ACTION_UPDATE_FILE_CLUSTER_FILTERS:
    case ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS:
    case ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE:
    case ACTION_FETCH_FILE_CLUSTER:
    case ACTION_FETCH_FILE_CLUSTER_SUCCESS:
    case ACTION_FETCH_FILE_CLUSTER_FAILURE:
      return {
        ...state,
        fileCluster: fileClusterReducer(state.fileCluster, action),
      };
    default:
      return state;
  }
}
