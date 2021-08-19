import initialState from "./initialState";
import {
  queryCacheReducer,
  queryFailed,
  queryItems,
  releaseQuery,
  updateQuery,
  useQuery,
} from "../../../common/queryCache";
import {
  ACTION_ACQUIRE_OBJECTS_QUERY,
  ACTION_OBJECTS_QUERY_FAILED,
  ACTION_QUERY_OBJECTS,
  ACTION_RELEASE_OBJECTS_QUERY,
  ACTION_UPDATE_OBJECTS_QUERY,
} from "./actions";
import { ACTION_UPDATE_OBJECT } from "../common/actions";
import lodash from "lodash";
import { updateEntity } from "../../../common/queryCache/reducer";
import checkObjectFilters from "./helpers/checkObjectFilters";
import makeObjectComparator from "./helpers/makeObjectComparator";

/**
 * Objects query cache reducer.
 *
 * @param {QueryCache} state
 * @param {ObjectsQueryAction|ObjectAction} action
 * @return {QueryCache}
 */
export default function objectsQueryReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_QUERY_OBJECTS:
      return queryCacheReducer(
        state,
        queryItems(action.params, action.request)
      );
    case ACTION_UPDATE_OBJECTS_QUERY:
      return queryCacheReducer(
        state,
        updateQuery({
          params: action.params,
          items: action.objects,
          total: action.total,
          request: action.request,
        })
      );
    case ACTION_OBJECTS_QUERY_FAILED:
      return queryCacheReducer(
        state,
        queryFailed(action.params, action.request)
      );
    case ACTION_ACQUIRE_OBJECTS_QUERY:
      return queryCacheReducer(state, useQuery(action.params));
    case ACTION_RELEASE_OBJECTS_QUERY:
      return queryCacheReducer(state, releaseQuery(action.params));
    case ACTION_UPDATE_OBJECT: {
      const updates = action.object;
      const updater = (existing) => lodash.merge({}, existing, updates);
      return updateEntity(
        state,
        updates,
        updater,
        checkObjectFilters,
        makeObjectComparator
      );
    }
    default:
      return state;
  }
}
