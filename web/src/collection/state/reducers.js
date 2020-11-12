import {
  ACTION_CACHE_FILE,
  ACTION_CHANGE_FILE_LIST_VIEW,
  ACTION_FETCH_FILE_CLUSTER,
  ACTION_FETCH_FILE_CLUSTER_FAILURE,
  ACTION_FETCH_FILE_CLUSTER_SUCCESS,
  ACTION_FETCH_FILE_MATCHES,
  ACTION_FETCH_FILE_MATCHES_FAILURE,
  ACTION_FETCH_FILE_MATCHES_SUCCESS,
  ACTION_FETCH_FILES,
  ACTION_FETCH_FILES_FAILURE,
  ACTION_FETCH_FILES_SUCCESS,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE,
  ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS,
  ACTION_UPDATE_FILE_MATCH_FILTERS,
  ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE,
  ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS,
  ACTION_UPDATE_FILTERS,
  ACTION_UPDATE_FILTERS_FAILURE,
  ACTION_UPDATE_FILTERS_SUCCESS,
} from "./actions";
import { MatchCategory } from "./MatchCategory";
import { FileSort } from "./FileSort";
import FileListType from "./FileListType";

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
  fileCache: {
    maxSize: 1000,
    files: {},
    history: [],
  },
  /**
   * File cluster
   */
  fileCluster: {
    filters: {
      fileId: undefined,
      hops: 2,
      minDistance: 0.0,
      maxDistance: 1.0,
      fields: ["meta", "exif"],
    },
    total: undefined,
    error: false,
    loading: false,
    limit: 100,
    matches: [],
    files: {},
  },
  /**
   * Immediate file matches
   */
  fileMatches: {
    fileId: undefined,
    filters: {
      fields: ["meta", "exif"],
    },
    total: undefined,
    error: false,
    loading: false,
    limit: 100,
    offset: 0,
    matches: [],
  },
};

/**
 * Default collection filters.
 */
export const defaultFilters = initialState.filters;

function fileCacheReducer(state = initialState.fileCache, action) {
  switch (action.type) {
    case ACTION_CACHE_FILE: {
      const files = { ...state.files, [action.file.id]: action.file };
      const history = [
        action.file.id,
        ...state.history.filter((id) => id !== action.file.id),
      ];
      if (history.length > state.maxSize) {
        const evicted = history.pop();
        delete files[evicted];
      }
      return { ...state, history, files };
    }
    default:
      return state;
  }
}

function fileMatchesReducer(state = initialState.fileMatches, action) {
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

function fileClusterReducer(state = initialState.fileCluster, action) {
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
