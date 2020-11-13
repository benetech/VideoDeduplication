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
