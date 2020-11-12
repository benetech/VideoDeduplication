/**
 * Action type of "Update file match filters and fetch the first slice".
 */
export const ACTION_UPDATE_FILE_MATCH_FILTERS =
  "coll.UPDATE_FILE_MATCH_FILTERS";

/**
 * Create a new instance of "Update file match filters and fetch the first
 * slice" action.
 *
 * @param {Object} filters - The new match filters that should be used.
 * @return The new action.
 */
export function updateFileMatchFilters(filters) {
  return { filters, type: ACTION_UPDATE_FILE_MATCH_FILTERS };
}

/**
 * Action type of "Success of match filter update"
 */
export const ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS =
  "coll.UPDATE_FILE_MATCH_FILTERS_SUCCESS";

/**
 * Create a new instance of "Success of match filter update" action.
 * @param {Array} matches - The fetched matches.
 * @param {number} total - The total number of matches that satisfy the filters.
 * @return The new action.
 */
export function updateFileMatchFiltersSuccess(matches, total) {
  return { matches, total, type: ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS };
}

/**
 * Action type of "Failure of match filter update"
 */
export const ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE =
  "coll.UPDATE_FILE_MATCH_FILTERS_FAILURE";

/**
 * Create a new instance of "Failure of match filter update" action.
 * @param error - The error details.
 * @return The new action.
 */
export function updateFileMatchFiltersFailure(error) {
  return { type: ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE, error };
}

/**
 * Action type of "Fetch the next slice of file matches".
 */
export const ACTION_FETCH_FILE_MATCHES = "coll.FETCH_FILE_MATCHES";

/**
 * Create a new instance of "Fetch the next slice of file matches" action.
 * @return The new action.
 */
export function fetchFileMatches() {
  return { type: ACTION_FETCH_FILE_MATCHES };
}

/**
 * Action type of "Success of the next matches slice fetch".
 */
export const ACTION_FETCH_FILE_MATCHES_SUCCESS =
  "coll.FETCH_FILE_MATCHES_SUCCESS";

/**
 * Create a new instance of "Success of the next slice fetch" action.
 * @param matches - The new fetched slice of matches.
 * @param total - The total number of matches that satisfy filters.
 * @return The new action.
 */
export function fetchFileMatchesSuccess(matches, total) {
  return { matches, total, type: ACTION_FETCH_FILE_MATCHES_SUCCESS };
}

/**
 * Action type for "Failure of the next matches slice fetch".
 */
export const ACTION_FETCH_FILE_MATCHES_FAILURE =
  "coll.FETCH_FILE_MATCHES_FAILURE";

/**
 * Create a new instance of "Failure of the next matches slice fetch" action.
 * @param error - The error that describes failure.
 * @return The new action.
 */
export function fetchFileMatchesFailure(error) {
  return { error, type: ACTION_FETCH_FILE_MATCHES_FAILURE };
}
