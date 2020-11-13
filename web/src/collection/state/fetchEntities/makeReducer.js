import lodash from "lodash";
import extendEntityList from "../helpers/extendEntityList";

export default function makeReducer({
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
        const params = lodash.merge({}, state.params, action.params);
        return {
          ...state,
          params,
          loading: false,
          error: false,
          total: undefined,
          items: [],
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
        return {
          ...state,
          loading: false,
          error: false,
          [resourceName]: extendEntityList(
            state[resourceName],
            action[resourceName]
          ),
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
