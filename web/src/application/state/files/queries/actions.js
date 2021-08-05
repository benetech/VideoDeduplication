import { v4 as uuid } from "uuid";

export const ACTION_QUERY_FILES = "filesQuery.QUERY_FILES";

/**
 * Start files query
 * @param {FileFilters} params file query parameters
 * @return {{type: string, request: string, params: FileFilters}}
 */
export function queryFiles(params) {
  return { type: ACTION_QUERY_FILES, params, request: uuid() };
}

export const ACTION_UPDATE_FILES_QUERY = "filesQuery.UPDATE_FILES_QUERY";

/**
 * Update files query.
 * @param {FileFilters} params query filters
 * @param {[*]} files queried files
 * @param {{}} counts file counts by match status
 * @param {string|null} request request id
 * @return {{request: string|null, counts: {}, files: [*], type: string, params: FileFilters}}
 */
export function updateFilesQuery({ params, files, counts, request = null }) {
  return { type: ACTION_UPDATE_FILES_QUERY, params, files, counts, request };
}

export const ACTION_FILES_QUERY_FAILED = "filesQuery.FILES_QUERY_FAILED";

/**
 * Mark files query as failed
 * @param {FileFilters} params
 * @param {string} request request id
 * @return {{request: string, type: string, params: FileFilters}}
 */
export function filesQueryFailed(params, request) {
  return { type: ACTION_FILES_QUERY_FAILED, params, request };
}

export const ACTION_ACQUIRE_FILES_QUERY = "filesQuery.ACQUIRE_FILES_QUERY";

/**
 * Acquire files query.
 * @param {FileFilters} params
 * @return {{type: string, params: FileFilters}}
 */
export function acquireFilesQuery(params) {
  return { type: ACTION_ACQUIRE_FILES_QUERY, params };
}
export const ACTION_RELEASE_FILES_QUERY = "filesQuery.RELEASE_FILES_QUERY";

/**
 * Release files query.
 * @param {FileFilters} params
 * @return {{type: string, params: FileFilters}}
 */
export function releaseFilesQuery(params) {
  return { type: ACTION_RELEASE_FILES_QUERY, params };
}
