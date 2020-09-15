import {
  ACTION_CACHE_FILE,
  ACTION_FETCH_FILES,
  ACTION_FETCH_FILES_FAILURE,
  ACTION_FETCH_FILES_SUCCESS,
  ACTION_UPDATE_FILTERS,
  ACTION_UPDATE_FILTERS_FAILURE,
  ACTION_UPDATE_FILTERS_SUCCESS,
} from "./actions";

export const initialState = {
  error: false,
  loading: false,
  files: [],
  filters: {
    query: "",
    extensions: [],
  },
  page: 0,
  pageSize: 20,
  counts: {
    total: 0,
    related: 0,
    duplicates: 0,
    unique: 0,
  },
  /**
   * File id=>file LRU cache
   */
  fileCache: {
    maxSize: 100,
    files: {},
    history: [],
  },
};

function filenames(files) {
  const result = new Set();
  for (let file of files) {
    result.add(file.filename);
  }
  return result;
}

function extendFiles(existing, loaded) {
  const existingNames = filenames(existing);
  const newFiles = loaded.filter((item) => !existingNames.has(item.filename));
  return [...existing, ...newFiles];
}

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

export function collRootReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        files: [],
        loading: true,
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
      };
    case ACTION_FETCH_FILES_SUCCESS:
      return {
        ...state,
        error: false,
        files: extendFiles(state.files, action.files),
        counts: { ...action.counts },
        page: state.page + 1,
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
    default:
      return state;
  }
}
