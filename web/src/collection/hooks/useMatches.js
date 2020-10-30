import lodash from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFileMatches } from "../state/selectors";
import { fetchFileMatches, updateFileMatchFilters } from "../state/actions";

/**
 * Fetch all file matches satisfying filter criteria.
 * @param id file id
 * @param filters match loading filters
 */
export function useMatches(id, filters = { hops: 1 }) {
  const state = useSelector(selectFileMatches);
  const dispatch = useDispatch();
  const [mergedFilters, setMergedFilters] = useState({
    ...state.filters,
    ...filters,
  });

  // Update merged filters.
  // Do not update if the result is not changed.
  useEffect(() => {
    const newFilters = { ...state.filters, ...filters };
    if (!lodash.isEqual(mergedFilters, newFilters)) {
      setMergedFilters(newFilters);
    }
  }, [filters, state.filters]);

  // Start/Resume loading handler.
  const loadMatches = useCallback(() => {
    if (state.fileId !== id || !lodash.isEqual(mergedFilters, state.filters)) {
      dispatch(updateFileMatchFilters(id, mergedFilters));
    } else {
      dispatch(fetchFileMatches());
    }
  }, [id, mergedFilters, state.filters]);

  /**
   * Initiate fetching.
   */
  useEffect(() => {
    dispatch(updateFileMatchFilters(id, mergedFilters));
  }, [id, mergedFilters]);

  /**
   * Fetch next page if available.
   */
  useEffect(() => {
    if (state.loading || state.error || state.matches.length >= state.total) {
      return;
    }
    dispatch(fetchFileMatches());
  }, [state]);

  const hasMore =
    state.total === undefined ||
    state.matches.length < state.total ||
    state.fileId !== id;

  return {
    matches: state.matches,
    files: state.files,
    total: state.total,
    error: state.error,
    loadMatches,
    hasMore,
  };
}

export default useMatches;
