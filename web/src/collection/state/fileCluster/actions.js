export const ACTION_UPDATE_FILE_CLUSTER_PARAMS =
  "coll.UPDATE_FILE_CLUSTER_PARAMS";

export function updateFileClusterParams(params) {
  return { params, type: ACTION_UPDATE_FILE_CLUSTER_PARAMS };
}

export const ACTION_FETCH_FILE_CLUSTER_SLICE = "coll.FETCH_FILE_CLUSTER_SLICE";

export function fetchFileClusterSlice() {
  return { type: ACTION_FETCH_FILE_CLUSTER_SLICE };
}

export const ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS =
  "coll.FETCH_FILE_CLUSTER_SLICE_SUCCESS";

export function fetchFileClusterSliceSuccess({ matches, files, total }) {
  return {
    matches,
    files,
    total,
    type: ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS,
  };
}

export const ACTION_FETCH_FILE_CLUSTER_SLICE_FAILURE =
  "coll.FETCH_FILE_CLUSTER_SLICE_FAILURE";

export function fetchFileClusterSliceFailure(error) {
  return { error, type: ACTION_FETCH_FILE_CLUSTER_SLICE_FAILURE };
}

/**
 * Action type of "Update file cluster filters and fetch the first slice".
 */
export const ACTION_UPDATE_FILE_CLUSTER_FILTERS =
  "coll.UPDATE_FILE_CLUSTER_FILTERS";

/**
 * Create a new instance of "Update file cluster filters and fetch the first
 * slice" action.
 *
 * @param {Object} filters - The new cluster filters that should be used.
 * @return The new action.
 */
export function updateFileClusterFilters(filters) {
  return { filters, type: ACTION_UPDATE_FILE_CLUSTER_FILTERS };
}

/**
 * Action type of "Success of cluster filter update"
 */
export const ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS =
  "coll.UPDATE_FILE_CLUSTER_FILTERS_SUCCESS";

/**
 * Create a new instance of "Success of cluster filter update" action.
 * @param {Array} matches - The fetched matches.
 * @param {Array} files - The fetched files.
 * @param {number} total - The total number of matches that comprise the cluster.
 * @return The new action.
 */
export function updateFileClusterFiltersSuccess(matches, files, total) {
  return {
    matches,
    files,
    total,
    type: ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS,
  };
}

/**
 * Action type of "Failure of cluster filter update"
 */
export const ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE =
  "coll.UPDATE_FILE_CLUSTER_FILTERS_FAILURE";

/**
 * Create a new instance of "Failure of cluster filter update" action.
 * @param error - The error details.
 * @return The new action.
 */
export function updateFileClusterFiltersFailure(error) {
  return { type: ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE, error };
}

/**
 * Action type of "Fetch the next slice of file cluster".
 */
export const ACTION_FETCH_FILE_CLUSTER = "coll.FETCH_FILE_CLUSTER";

/**
 * Create a new instance of "Fetch the next slice of file cluster" action.
 * @return The new action.
 */
export function fetchFileCluster() {
  return { type: ACTION_FETCH_FILE_CLUSTER };
}

/**
 * Action type of "Success of fetching the next cluster slice".
 */
export const ACTION_FETCH_FILE_CLUSTER_SUCCESS =
  "coll.FETCH_FILE_CLUSTER_SUCCESS";

/**
 * Create a new instance of "Success of fetching the next slice" action.
 * @param {Array} matches - The new fetched slice of matches.
 * @param {Array} files - The new fetched slice of files.
 * @param {number }total - The total number of matches that satisfy filters.
 * @return The new action.
 */
export function fetchFileClusterSuccess(matches, files, total) {
  return { matches, files, total, type: ACTION_FETCH_FILE_CLUSTER_SUCCESS };
}

/**
 * Action type for "Failure of fetching the next cluster slice".
 */
export const ACTION_FETCH_FILE_CLUSTER_FAILURE =
  "coll.FETCH_FILE_CLUSTER_FAILURE";

/**
 * Create a new instance of "Failure of fetching the next cluster slice" action.
 * @param error - The error that describes failure.
 * @return The new action.
 */
export function fetchFileClusterFailure(error) {
  return { error, type: ACTION_FETCH_FILE_CLUSTER_FAILURE };
}
