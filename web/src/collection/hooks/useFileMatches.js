import lodash from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFileCluster, selectFileMatches } from "../state/selectors";
import { fetchFileCluster, updateFileClusterFilters } from "../state/actions";

/**
 * Fetch all file matches satisfying filter criteria.
 * @param id file id
 * @param filters cluster loading filters
 */
export default function useFileMatches(id, filters = {}) {
  const state = useSelector(selectFileMatches);
  const dispatch = useDispatch();
  const [mergedFilters, setMergedFilters] = useState({
    ...state.filters,
    ...filters,
  });

  // Update merged filters if and only if
  // their actual values have changed.
  useEffect(() => {
    const newFilters = { ...state.filters, ...filters };
    if (!lodash.isEqual(mergedFilters, newFilters)) {
      setMergedFilters(newFilters);
    }
  }, [filters, state.filters]);

  // Start/Resume loading handler.
  const loadCluster = useCallback(() => {
    if (state.fileId !== id || !lodash.isEqual(mergedFilters, state.filters)) {
      dispatch(updateFileClusterFilters(id, mergedFilters));
    } else {
      dispatch(fetchFileCluster());
    }
  }, [id, mergedFilters, state.filters]);

  /**
   * Initiate fetch every time merged filters have changed.
   */
  useEffect(() => {
    dispatch(updateFileClusterFilters(id, mergedFilters));
  }, [id, mergedFilters]);

  /**
   * Fetch next page if available.
   */
  useEffect(() => {
    if (
      state.loading ||
      state.error ||
      state.matches.length >= state.total ||
      state.total == null
    ) {
      return;
    }
    dispatch(fetchFileCluster());
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
    loadCluster,
    hasMore,
  };
}
