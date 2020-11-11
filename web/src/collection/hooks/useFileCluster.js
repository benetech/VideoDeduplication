import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFileCluster } from "../state/selectors";
import { fetchFileCluster, updateFileClusterFilters } from "../state/actions";
import useLoadAll from "./useLoadAll";
import { initialState } from "../state";

/**
 * Check if auto-loading may continue.
 */
function mayContinue(fileClusterState, fileId) {
  return !(
    fileClusterState.loading ||
    fileClusterState.error ||
    fileClusterState.matches.length >= fileClusterState.total ||
    fileClusterState.total == null ||
    fileClusterState.filters.fileId !== fileId
  );
}

/**
 * Check if loading may be continued.
 */
function hasMore(fileClusterState, fileId) {
  return (
    fileClusterState.total == null ||
    fileClusterState.matches.length < fileClusterState.total ||
    fileClusterState.filters.fileId !== fileId
  );
}

/**
 * Fetch all file cluster elements satisfying filter criteria.
 * @param filters cluster loading filters
 */
export default function useFileCluster(filters) {
  if (filters.fileId == null) {
    throw new Error("File id cannot be null.");
  }

  const dispatch = useDispatch();
  const fileCluster = useSelector(selectFileCluster);

  const handleStart = useCallback(
    (mergedFilters) => dispatch(updateFileClusterFilters(mergedFilters)),
    []
  );
  const handleContinue = useCallback(() => dispatch(fetchFileCluster()), []);

  const resumeLoading = useLoadAll({
    requestedFilters: filters,
    defaultFilters: initialState.fileCluster.filters,
    savedFilters: fileCluster.filters,
    mayContinue: mayContinue(fileCluster, filters.fileId),
    startFetching: handleStart,
    continueFetching: handleContinue,
  });

  return {
    matches: fileCluster.matches,
    files: fileCluster.files,
    total: fileCluster.total,
    error: fileCluster.error,
    resumeLoading,
    hasMore: hasMore(fileCluster, filters.fileId),
  };
}
