import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFileMatches } from "../state/selectors";
import {
  fetchFileMatches,
  updateFileMatchFilters,
} from "../state/fileMatches/actions";
import useLoadAll from "./useLoadAll";
import initialState from "../state/fileMatches/initialState";

/**
 * Check if auto-loading may continue.
 */
function mayContinue(fileMatchesState, fileId) {
  return !(
    fileMatchesState.loading ||
    fileMatchesState.error ||
    fileMatchesState.matches.length >= fileMatchesState.total ||
    fileMatchesState.total == null ||
    fileMatchesState.filters.fileId !== fileId
  );
}

/**
 * Check if there are remaining matches.
 */
function hasMore(fileMatchesState, fileId) {
  return (
    fileMatchesState.total == null ||
    fileMatchesState.matches.length < fileMatchesState.total ||
    fileMatchesState.filters.fileId !== fileId
  );
}

/**
 * Fetch all immediate file matches filtering criteria.
 * @param filters match loading filters
 */
export default function useFileMatches(filters) {
  if (filters.fileId == null) {
    throw new Error("File id cannot be null.");
  }

  const dispatch = useDispatch();
  const fileMatches = useSelector(selectFileMatches);

  const handleStart = useCallback(
    (mergedFilters) => dispatch(updateFileMatchFilters(mergedFilters)),
    []
  );
  const handleContinue = useCallback(() => dispatch(fetchFileMatches()), []);

  const resumeLoading = useLoadAll({
    requestedFilters: filters,
    defaultFilters: initialState.filters,
    savedFilters: fileMatches.filters,
    mayContinue: mayContinue(fileMatches, filters.fileId),
    startFetching: handleStart,
    continueFetching: handleContinue,
  });

  return {
    matches: fileMatches.matches,
    total: fileMatches.total,
    error: fileMatches.error,
    resumeLoading,
    hasMore: hasMore(fileMatches, filters.fileId),
  };
}
