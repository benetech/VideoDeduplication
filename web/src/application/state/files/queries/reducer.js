import {
  initialState,
  queryCacheReducer,
  updateQuery,
  queryItems,
  queryFailed,
  useQuery,
  releaseQuery,
} from "../../../common/queryCache";
import {
  ACTION_FILES_QUERY_FAILED,
  ACTION_QUERY_FILES,
  ACTION_RELEASE_FILES_QUERY,
  ACTION_UPDATE_FILES_QUERY,
  ACTION_ACQUIRE_FILES_QUERY,
} from "./actions";

export default function filesQueryReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_QUERY_FILES:
      return queryCacheReducer(
        state,
        queryItems(action.params, action.request)
      );
    case ACTION_UPDATE_FILES_QUERY:
      return queryCacheReducer(
        state,
        updateQuery({
          params: action.params,
          items: action.files,
          total: action.counts[action.params.matches],
          data: { counts: action.counts },
          request: action.request,
        })
      );
    case ACTION_FILES_QUERY_FAILED:
      return queryCacheReducer(
        state,
        queryFailed(action.params, action.request)
      );
    case ACTION_ACQUIRE_FILES_QUERY:
      return queryCacheReducer(state, useQuery(action.params));
    case ACTION_RELEASE_FILES_QUERY:
      return queryCacheReducer(state, releaseQuery(action.params));
    default:
      return state;
  }
}
