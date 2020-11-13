import lodash from "lodash";
import { useCallback, useEffect } from "react";
import useValue from "../../hooks/useValue";

/**
 * Generic hook to load all available entities without any assumptions
 * on application state.
 */
export default function useFetchAllGeneric({
  desiredParams,
  defaultParams,
  savedParams,
  mayContinue,
  updateParams,
  fetchSlice,
}) {
  const mergedParams = useValue({ ...defaultParams, ...desiredParams });

  // Update filters and fetch the first slice when filters are changed
  useEffect(() => {
    updateParams(mergedParams);
  }, [mergedParams, updateParams]);

  // Fetch the next slice when ready.
  useEffect(() => {
    if (mayContinue) {
      fetchSlice();
    }
  }, [mayContinue, fetchSlice, mergedParams]);

  // Provide callback to resume loading on error.
  return useCallback(() => {
    if (!lodash.isEqual(mergedParams, savedParams)) {
      updateParams(mergedParams);
    } else {
      fetchSlice(mergedParams);
    }
  }, [mergedParams, savedParams, updateParams, fetchSlice]);
}
