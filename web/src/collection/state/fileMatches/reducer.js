import {
  ACTION_DELETE_FILE_MATCH,
  ACTION_FETCH_FILE_MATCHES_SLICE,
  ACTION_FETCH_FILE_MATCHES_SLICE_FAILURE,
  ACTION_FETCH_FILE_MATCHES_SLICE_SUCCESS,
  ACTION_RESTORE_FILE_MATCH,
  ACTION_UPDATE_FILE_MATCHES_PARAMS,
  ACTION_UPDATE_MATCH,
} from "./actions";
import initialState from "./initialState";
import makeEntityReducer from "../fetchEntities/makeEntityReducer";
import lodash from "lodash";

const defaultFileMatchesReducer = makeEntityReducer({
  updateParams: ACTION_UPDATE_FILE_MATCHES_PARAMS,
  fetchSlice: ACTION_FETCH_FILE_MATCHES_SLICE,
  fetchSliceSuccess: ACTION_FETCH_FILE_MATCHES_SLICE_SUCCESS,
  fetchSliceFailure: ACTION_FETCH_FILE_MATCHES_SLICE_FAILURE,
  initialState: initialState,
  resourceName: "matches",
});

export default function fileMatchesReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_UPDATE_MATCH: {
      const updatedMatches = state.matches.map((match) => {
        if (match.id === action.match.id) {
          return lodash.merge({}, match, action.match);
        }
        return match;
      });
      return {
        ...state,
        matches: updatedMatches,
      };
    }
    case ACTION_DELETE_FILE_MATCH: {
      const updatedMatches = state.matches.map((match) => {
        if (match.id === action.match.id) {
          return { ...match, falsePositive: true };
        }
        return match;
      });
      return {
        ...state,
        matches: updatedMatches,
      };
    }
    case ACTION_RESTORE_FILE_MATCH: {
      const updatedMatches = state.matches.map((match) => {
        if (match.id === action.match.id) {
          return { ...match, falsePositive: false };
        }
        return match;
      });
      return {
        ...state,
        matches: updatedMatches,
      };
    }
    default:
      return defaultFileMatchesReducer(state, action);
  }
}
