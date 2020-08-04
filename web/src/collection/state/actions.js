export const ACTION_UPDATE_FILTERS = "coll.UPDATE_FILTERS";

export function updateFilters(filters) {
  return { type: ACTION_UPDATE_FILTERS, filters };
}

export const ACTION_FETCH_FILES = "coll.FETCH_FILES";

/**
 * Fetch next `limit` files.
 */
export function fetchFiles() {
  return { type: ACTION_FETCH_FILES };
}

export const ACTION_FETCH_FILES_SUCCESS = "coll.FETCH_FILES_SUCCESS";

export function fetchFilesSuccess(files, counts) {
  return { type: ACTION_FETCH_FILES_SUCCESS, files, counts };
}

export const ACTION_FETCH_FILES_FAILURE = "coll.FETCH_FILES_FAILURE";

export function fetchFilesFailure(error) {
  return { type: ACTION_FETCH_FILES_FAILURE, error };
}
