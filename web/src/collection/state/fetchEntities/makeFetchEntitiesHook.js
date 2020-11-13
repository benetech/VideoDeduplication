/**
 * Generic hook to load all available entities assuming the application state
 * obeys convention of the fetchEntity framework.
 */
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import useFetchAllGeneric from "./useFetchAllGeneric";

/**
 * Check if auto-loading may continue.
 */
function mayContinue(state, desiredParams, resourceName) {
  return !(
    state.loading ||
    state.error ||
    state[resourceName].length >= state.total ||
    state.total == null ||
    !lodash.isEqual(state.params, desiredParams)
  );
}

/**
 * Check if there are remaining cluster items.
 */
function hasMore(state, desiredParams, resourceName) {
  return (
    state.total == null ||
    state[resourceName].length < state.total ||
    !lodash.isEqual(state.params, desiredParams)
  );
}

export default function makeFetchEntitiesHook({
  updateParams,
  fetchSlice,
  stateSelector,
  defaultParams,
  resourceName,
}) {
  return function useFetchEntities(desiredParams) {
    const dispatch = useDispatch();
    const state = useSelector(stateSelector);

    const handleUpdate = useCallback(
      (mergedParams) => dispatch(updateParams(mergedParams)),
      [updateParams]
    );

    const handleFetch = useCallback(() => dispatch(fetchSlice()), [fetchSlice]);

    const resumeLoading = useFetchAllGeneric({
      desiredParams: desiredParams,
      defaultParams: defaultParams,
      savedParams: state.params,
      updateParams: handleUpdate,
      fetchSlice: handleFetch,
      mayContinue: mayContinue(state, desiredParams, resourceName),
    });

    return {
      [resourceName]: state[resourceName],
      total: state.total,
      error: state.error,
      resumeLoading,
      hasMore: hasMore(state, desiredParams, resourceName),
    };
  };
}
