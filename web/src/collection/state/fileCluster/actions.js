/**
 * "Update cluster params" action type.
 * @type {string}
 */
export const ACTION_UPDATE_FILE_CLUSTER_PARAMS =
  "coll.UPDATE_FILE_CLUSTER_PARAMS";

/**
 * Create new update-cluster-params action.
 */
export function updateFileClusterParams(params, preserveItems = false) {
  return { params, preserveItems, type: ACTION_UPDATE_FILE_CLUSTER_PARAMS };
}

/**
 * "Fetch the next cluster slice" action type.
 * @type {string}
 */
export const ACTION_FETCH_FILE_CLUSTER_SLICE = "coll.FETCH_FILE_CLUSTER_SLICE";

/**
 * Create new "Fetch the next cluster slice" action.
 * @return {{type: string}}
 */
export function fetchFileClusterSlice() {
  return { type: ACTION_FETCH_FILE_CLUSTER_SLICE };
}

/**
 * "Success of cluster slice fetching" action type.
 * @type {string}
 */
export const ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS =
  "coll.FETCH_FILE_CLUSTER_SLICE_SUCCESS";

/**
 * Create new "Success of cluster slice fetching" action.
 */
export function fetchFileClusterSliceSuccess({ data, params }) {
  return {
    data,
    params,
    type: ACTION_FETCH_FILE_CLUSTER_SLICE_SUCCESS,
  };
}

/**
 * "Failure of cluster slice fetching" action type.
 * @type {string}
 */
export const ACTION_FETCH_FILE_CLUSTER_SLICE_FAILURE =
  "coll.FETCH_FILE_CLUSTER_SLICE_FAILURE";

/**
 * Create new "Failure of cluster slice fetching" action.
 * @param error
 * @return {{error: *, type: string}}
 */
export function fetchFileClusterSliceFailure(error) {
  return { error, type: ACTION_FETCH_FILE_CLUSTER_SLICE_FAILURE };
}
