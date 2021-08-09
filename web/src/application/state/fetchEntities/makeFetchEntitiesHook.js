import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import useValue from "../../../lib/hooks/useValue";
import lodash from "lodash";

/**
 * Check if auto-loading may continue.
 */
function getMayContinue(state, mergedParams, resourceName) {
  return !(
    state.loading ||
    state.error ||
    state[resourceName].length >= state.total ||
    !lodash.isEqual(state.params, mergedParams)
  );
}

/**
 * Check if there are remaining cluster items.
 */
function hasMore(state, mergedParams, resourceName) {
  return (
    state.total == null ||
    state[resourceName].length < state.total ||
    !lodash.isEqual(state.params, mergedParams)
  );
}

/**
 * Make a hook to load all available entities assuming the application state
 * obeys convention of the fetchEntity framework.
 */
export default function makeFetchEntitiesHook({
  updateParams,
  fetchNextSlice,
  stateSelector,
  defaultParams,
  resourceName,
}) {
  return function useFetchEntities(desiredParams) {
    const dispatch = useDispatch();
    const state = useSelector(stateSelector);
    const savedParams = state.params;
    const mergedParams = useValue(
      lodash.merge({}, defaultParams, desiredParams)
    );
    const mayContinue = getMayContinue(state, mergedParams, resourceName);

    // Update filters and fetch the first slice when filters are changed
    useEffect(() => {
      dispatch(updateParams(mergedParams));
    }, [mergedParams]);

    // Fetch the next slice when ready.
    useEffect(() => {
      if (mayContinue) {
        dispatch(fetchNextSlice());
      }
    }, [mayContinue, mergedParams]);

    // Provide callback to resume loading on error.
    const resumeLoading = useCallback(() => {
      if (!lodash.isEqual(mergedParams, savedParams)) {
        dispatch(updateParams(mergedParams));
      } else {
        dispatch(fetchNextSlice(mergedParams));
      }
    }, [mergedParams, savedParams]);

    return {
      [resourceName]: state[resourceName],
      total: state.total,
      error: state.error,
      resumeLoading,
      hasMore: hasMore(state, mergedParams, resourceName),
    };
  };
}
