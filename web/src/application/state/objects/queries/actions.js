import { v4 as uuid } from "uuid";

export const ACTION_QUERY_OBJECTS = "objectsQuery.QUERY_OBJECTS";

/**
 * @typedef {{
 *   type: string,
 *   params: TemplateMatchFilters,
 *   request: string|undefined|null,
 *   objects: ObjectEntity[]|undefined,
 *   total: number|undefined,
 * }} ObjectsQueryAction
 */

/**
 * Start objects query.
 * @param {TemplateMatchFilters} params
 * @return {ObjectsQueryAction}
 */
export function queryObjects(params) {
  return { type: ACTION_QUERY_OBJECTS, params, request: uuid() };
}

export const ACTION_UPDATE_OBJECTS_QUERY = "objectsQuery.UPDATE_OBJECTS_QUERY";

/**
 * Update objects query.
 *
 * @param {TemplateMatchFilters} params
 * @param {ObjectEntity[]} objects
 * @param {number} total
 * @param {string|null} request
 * @return {ObjectsQueryAction}
 */
export function updateObjectsQuery({ params, objects, total, request = null }) {
  return {
    type: ACTION_UPDATE_OBJECTS_QUERY,
    params,
    objects,
    total,
    request,
  };
}

export const ACTION_OBJECTS_QUERY_FAILED = "objectsQuery.OBJECTS_QUERY_FAILED";

/**
 * Mark objects query as failed.
 *
 * @param {TemplateMatchFilters} params
 * @param {string} request
 * @return {ObjectsQueryAction}
 */
export function objectsQueryFailed(params, request) {
  return { type: ACTION_OBJECTS_QUERY_FAILED, params, request };
}

export const ACTION_ACQUIRE_OBJECTS_QUERY =
  "objectsQuery.ACQUIRE_OBJECTS_QUERY";

/**
 * Acquire (increment reference count of) objects query.
 * @param {TemplateMatchFilters} params
 * @return {ObjectsQueryAction}
 */
export function acquireObjectsQuery(params) {
  return { type: ACTION_ACQUIRE_OBJECTS_QUERY, params };
}

export const ACTION_RELEASE_OBJECTS_QUERY =
  "objectsQuery.RELEASE_OBJECTS_QUERY";

/**
 * Release (decrement reference count of) objects query.
 * @param {TemplateMatchFilters} params
 * @return {ObjectsQueryAction}
 */
export function releaseObjectsQuery(params) {
  return { type: ACTION_RELEASE_OBJECTS_QUERY, params };
}
