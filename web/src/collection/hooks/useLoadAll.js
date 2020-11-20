import lodash from "lodash";
import { useCallback, useEffect } from "react";
import useValue from "./useValue";

/**
 * Generic hook to load all available entities.
 */
export default function useLoadAll({
  requestedFilters,
  defaultFilters,
  savedFilters,
  mayContinue,
  startFetching,
  continueFetching,
}) {
  const mergedFilters = useValue({ ...defaultFilters, ...requestedFilters });

  // Update filters and fetch the first slice when filters are changed
  useEffect(() => {
    startFetching(mergedFilters);
  }, [mergedFilters, startFetching]);

  // Fetch the next slice when ready.
  useEffect(() => {
    if (mayContinue) {
      continueFetching(mergedFilters);
    }
  }, [mayContinue, continueFetching, mergedFilters]);

  // Provide callback to resume loading on error.
  return useCallback(() => {
    if (!lodash.isEqual(mergedFilters, savedFilters)) {
      startFetching(mergedFilters);
    } else {
      continueFetching(mergedFilters);
    }
  }, [mergedFilters, savedFilters, startFetching, continueFetching]);
}
