import FileListType from "./FileListType";

export const ACTION_CHANGE_FILE_LIST_VIEW = "coll.CHANGE_FILE_LIST_VIEW";

export function changeFileListView(view) {
  if (FileListType.values().indexOf(view) === -1) {
    throw new Error(`Unknown file list type: ${view}`);
  }
  return { type: ACTION_CHANGE_FILE_LIST_VIEW, view };
}

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
 * Single file matches actions
 */

export const ACTION_UPDATE_FILE_MATCH_FILTERS =
  "coll.UPDATE_FILE_MATCH_FILTERS";

export function updateFileMatchFilters(filters) {
  return { filters, type: ACTION_UPDATE_FILE_MATCH_FILTERS };
}

export const ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS =
  "coll.UPDATE_FILE_MATCH_FILTERS_SUCCESS";

export function updateFileMatchFiltersSuccess(matches, files, total) {
  return {
    matches,
    files,
    total,
    type: ACTION_UPDATE_FILE_MATCH_FILTERS_SUCCESS,
  };
}

export const ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE =
  "coll.UPDATE_FILE_MATCH_FILTERS_FAILURE";

export function updateFileMatchFiltersFailure(error) {
  return { type: ACTION_UPDATE_FILE_MATCH_FILTERS_FAILURE, error };
}

/**
 * Fetch next matches page
 */

export const ACTION_FETCH_FILE_MATCHES = "coll.FETCH_FILE_MATCHES";

export function fetchFileMatches() {
  return { type: ACTION_FETCH_FILE_MATCHES };
}

export const ACTION_FETCH_FILE_MATCHES_SUCCESS =
  "coll.FETCH_FILE_MATCHES_SUCCESS";

export function fetchFileMatchesSuccess(matches, files, total) {
  return { matches, files, total, type: ACTION_FETCH_FILE_MATCHES_SUCCESS };
}

export const ACTION_FETCH_FILE_MATCHES_FAILURE =
  "coll.FETCH_FILE_MATCHES_FAILURE";

export function fetchFileMatchesFailure(error) {
  return { error, type: ACTION_FETCH_FILE_MATCHES_FAILURE };
}

/**
 * File cluster actions
 */

export const ACTION_UPDATE_FILE_CLUSTER_FILTERS =
  "coll.UPDATE_FILE_CLUSTER_FILTERS";

export function updateFileClusterFilters(filters) {
  return { filters, type: ACTION_UPDATE_FILE_CLUSTER_FILTERS };
}

export const ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS =
  "coll.UPDATE_FILE_CLUSTER_FILTERS_SUCCESS";

export function updateFileClusterFiltersSuccess(matches, files, total) {
  return {
    matches,
    files,
    total,
    type: ACTION_UPDATE_FILE_CLUSTER_FILTERS_SUCCESS,
  };
}

export const ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE =
  "coll.UPDATE_FILE_CLUSTER_FILTERS_FAILURE";

export function updateFileClusterFiltersFailure(error) {
  return { type: ACTION_UPDATE_FILE_CLUSTER_FILTERS_FAILURE, error };
}

/**
 * Fetch next cluster items page
 */

export const ACTION_FETCH_FILE_CLUSTER = "coll.FETCH_FILE_CLUSTER";

export function fetchFileCluster() {
  return { type: ACTION_FETCH_FILE_CLUSTER };
}

export const ACTION_FETCH_FILE_CLUSTER_SUCCESS =
  "coll.FETCH_FILE_CLUSTER_SUCCESS";

export function fetchFileClusterSuccess(matches, files, total) {
  return { matches, files, total, type: ACTION_FETCH_FILE_CLUSTER_SUCCESS };
}

export const ACTION_FETCH_FILE_CLUSTER_FAILURE =
  "coll.FETCH_FILE_CLUSTER_FAILURE";

export function fetchFileClusterFailure(error) {
  return { error, type: ACTION_FETCH_FILE_CLUSTER_FAILURE };
}
