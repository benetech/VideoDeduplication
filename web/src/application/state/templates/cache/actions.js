export const ACTION_CACHE_TEMPLATE = "templateCache.CACHE_TEMPLATE";

/**
 * Cache a single template.
 * @param {TemplateEntity} template
 * @return {TemplateAction}
 */
export function cacheTemplate(template) {
  return { type: ACTION_CACHE_TEMPLATE, template };
}
