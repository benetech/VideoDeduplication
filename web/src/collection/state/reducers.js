import {
  ACTION_FETCH_FILES,
  ACTION_FETCH_FILES_FAILURE,
  ACTION_FETCH_FILES_SUCCESS,
  ACTION_UPDATE_FILTERS,
} from "./actions";

export const initialState = {
  loading: false,
  files: [],
  filters: {
    query: "",
  },
  limit: 50,
  counts: {
    total: 0,
    related: 0,
    duplicates: 0,
    unique: 0,
  },
};

export function collRootReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        loading: true,
      };
    case ACTION_FETCH_FILES:
      return {
        ...state,
        loading: true,
      };
    case ACTION_FETCH_FILES_SUCCESS:
      return {
        ...state,
        files: [...state.files, ...action.files],
        counts: { ...action.counts },
        loading: false,
      };
    case ACTION_FETCH_FILES_FAILURE:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}
