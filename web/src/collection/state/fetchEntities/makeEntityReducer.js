import lodash from "lodash";
import extendEntityList from "../helpers/extendEntityList";

export default function makeEntityReducer({
  updateParams,
  fetchSlice,
  fetchSliceSuccess,
  fetchSliceFailure,
  initialState,
  resourceName = "items",
}) {
  return function fetchEntityReducer(state = initialState, action) {
    switch (action.type) {
      case updateParams: {
        const params = lodash.merge({}, initialState.params, action.params);
        if (lodash.isEqual(state.params, params) && action.preserveItems) {
          // The request parameters are the same
          // and we don't want to refresh items.
          return state;
        }
        return {
          ...state,
          params,
          loading: false,
          error: false,
          total: undefined,
          [resourceName]: [],
        };
      }
      case fetchSlice:
        return {
          ...state,
          loading: true,
          error: false,
        };
      case fetchSliceSuccess:
        if (!state.loading) {
          const warning =
            `Unexpected state when handling ${fetchSliceSuccess}: ` +
            `state.loading must be true. Skipping...`;
          console.warn(warning);
          return state;
        }

        // Ignore responses unrelated to the current request params.
        if (!lodash.isEqual(state.params, action.params)) {
          const warning =
            `Unexpected params when handling ${fetchSliceSuccess}. ` +
            `state.params must be the same. Skipping...`;
          console.warn(warning, state.params, action.params);
          return state;
        }

        return {
          ...state,
          loading: false,
          error: false,
          [resourceName]: extendEntityList(
            state[resourceName],
            action.data[resourceName]
          ),
          total: action.data.total,
        };
      case fetchSliceFailure:
        return {
          ...state,
          loading: false,
          error: true,
        };
      default:
        return state;
    }
  };
}
