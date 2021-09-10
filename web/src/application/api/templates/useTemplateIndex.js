import { useMemo } from "react";
import useTemplatesAll from "./useTemplatesAll";
import DefaultTemplateFilters from "./helpers/DefaultTemplateFilters";

/**
 * Index templates by id.
 * @param {TemplateEntity[]} templates
 * @return {(Map<(string|number), TemplateEntity>)}
 */
function indexTemplates(templates) {
  const index = new Map();
  for (const template of templates) {
    index.set(template.id, template);
  }
  return index;
}

/**
 * Get id=>template index of the templates satisfying the given query params.
 *
 * @param {TemplateFilters} filters
 * @return {(Map<(string|number), TemplateEntity>)}
 */
export default function useTemplateIndex(filters = DefaultTemplateFilters) {
  const { templates } = useTemplatesAll(filters);
  return useMemo(() => indexTemplates(templates), [templates]);
}
