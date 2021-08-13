import { v4 as uuid } from "uuid";

export const ACTION_QUERY_TEMPLATES = "templatesQuery.QUERY_TEMPLATES";

/**
 * @typedef {{
 *   type: string,
 *   params: TemplateFilters,
 *   request: string|undefined|null,
 *   templates: TemplateEntity[]|undefined,
 *   total: number|undefined,
 * }} TemplatesQueryAction
 */

/**
 * Start templates query.
 * @param {TemplateFilters} params
 * @return {TemplatesQueryAction}
 */
export function queryTemplates(params) {
  return { type: ACTION_QUERY_TEMPLATES, params, request: uuid() };
}

export const ACTION_UPDATE_TEMPLATES_QUERY =
  "templateQuery.UPDATE_TEMPLATES_QUERY";

/**
 * Update templates query.
 *
 * @param {TemplateFilters} params
 * @param {TemplateEntity[]} templates
 * @param {number} total
 * @param {string|null} request
 * @return {TemplatesQueryAction}
 */
export function updateTemplatesQuery({
  params,
  templates,
  total,
  request = null,
}) {
  return {
    type: ACTION_UPDATE_TEMPLATES_QUERY,
    params,
    templates,
    total,
    request,
  };
}

export const ACTION_TEMPLATES_QUERY_FAILED =
  "templatesQuery.TEMPLATES_QUERY_FAILED";

/**
 * Mark templates query as failed.
 *
 * @param {TemplateFilters} params
 * @param {string} request
 * @return {TemplatesQueryAction}
 */
export function templatesQueryFailed(params, request) {
  return { type: ACTION_TEMPLATES_QUERY_FAILED, params, request };
}

export const ACTION_ACQUIRE_TEMPLATES_QUERY =
  "templatesQuery.ACQUIRE_TEMPLATES_QUERY";

/**
 * Acquire (increment reference count of) templates query.
 * @param {TemplateFilters} params
 * @return {TemplatesQueryAction}
 */
export function acquireTemplatesQuery(params) {
  return { type: ACTION_ACQUIRE_TEMPLATES_QUERY, params };
}

export const ACTION_RELEASE_TEMPLATES_QUERY =
  "templatesQuery.RELEASE_TEMPLATES_QUERY";

/**
 * Release (decrement reference count of) templates query.
 * @param {TemplateFilters} params
 * @return {TemplatesQueryAction}
 */
export function releaseTemplatesQuery(params) {
  return { type: ACTION_RELEASE_TEMPLATES_QUERY, params };
}
