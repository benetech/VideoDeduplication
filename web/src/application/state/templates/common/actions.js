export const ACTION_ADD_TEMPLATE = "templates.ADD_TEMPLATE";

/**
 * @typedef {{
 *   type: string,
 *   template: TemplateType|string|number|undefined,
 *   example: TemplateExampleType|undefined
 * }} TemplateAction
 */

/**
 * Add new template.
 *
 * The template must be added to all appropriate queries and caches.
 *
 * @param {TemplateType|string|number} template
 * @return {TemplateAction}
 */
export function addTemplate(template) {
  return { type: ACTION_ADD_TEMPLATE, template };
}

export const ACTION_DELETE_TEMPLATE = "templates.DELETE_TEMPLATE";

/**
 * Delete template.
 *
 * The template will be deleted from all queries and caches.
 *
 * @param {string|number|TemplateType} template
 * @return {TemplateAction}
 */
export function deleteTemplate(template) {
  return { type: ACTION_DELETE_TEMPLATE, template };
}

export const ACTION_UPDATE_TEMPLATE = "templates.UPDATE_TEMPLATE";

/**
 * Update template icon/name.
 *
 * Template will be updated in all queries and caches.
 *
 * @param {TemplateType} template
 * @return {TemplateAction}
 */
export function updateTemplate(template) {
  return { type: ACTION_UPDATE_TEMPLATE, template };
}

export const ACTION_ADD_EXAMPLE = "templates.ADD_EXAMPLE";

/**
 * Add example image to the template.
 *
 * The corresponding template will be updated in all queries and cache.
 *
 * @param {TemplateExampleType} example
 * @return {TemplateAction}
 */
export function addExample(example) {
  return { type: ACTION_ADD_EXAMPLE, example };
}

export const ACTION_DELETE_EXAMPLE = "templates.DELETE_EXAMPLE";

/**
 * Delete example image from template.
 *
 * The corresponding template will be updated in all queries and cache.
 *
 * @param {TemplateExampleType} example
 * @return {TemplateAction}
 */
export function deleteExample(example) {
  return { type: ACTION_DELETE_EXAMPLE, example };
}
