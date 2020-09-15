export const ACTION_UPDATE_FILTERS = "coll.UPDATE_FILTERS";

export function updateFilters(filters) {
  return { type: ACTION_UPDATE_FILTERS, filters };
}

export const ACTION_UPDATE_FILTERS_SUCCESS = "coll.UPDATE_FILTERS_SUCCESS";

export function updateFiltersSuccess(files, counts) {
  return { type: ACTION_UPDATE_FILTERS_SUCCESS, files, counts };
}

export const ACTION_UPDATE_FILTERS_FAILURE = "coll.UPDATE_FILTERS_FAILURE";

export function updateFiltersFailure(error) {
  return { type: ACTION_UPDATE_FILTERS_FAILURE, error };
}

/**
 * Fetch next files page.
 */
export const ACTION_FETCH_FILES = "coll.FETCH_FILES";

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

/**
 * Add file to cache.
 */

export const ACTION_CACHE_FILE = "coll.CACHE_FILE";

export function cacheFile(file) {
  return { file, type: ACTION_CACHE_FILE };
}

/**
 * Single file matches actions
 */

export const ACTION_UPDATE_FILE_MATCH_FILTERS =
  "coll.UPDATE_FILE_MATCH_FILTERS";

export function updateFileMatchFilters(fileId, filters) {
  return { fileId, filters, type: ACTION_UPDATE_FILE_MATCH_FILTERS };
}

export const ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS =
  "coll.UPDATE_FILE_MATCH_FILTERS_SUCCESS";

export function updateFileMatchFiltersSuccess(matches, total) {
  return { matches, total, type: ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS };
}

export const ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE =
  "coll.UPDATE_FILE_MATCH_FILTERS_FAILURE";

export function updateFileMatchFiltersFailure(error) {
  return { type: ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE };
}
