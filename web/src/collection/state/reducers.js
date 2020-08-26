import {
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
  },
  page: 0,
  pageSize: 20,
  counts: {
    total: 0,
    related: 0,
    duplicates: 0,
    unique: 0,
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
    default:
      return state;
  }
}
