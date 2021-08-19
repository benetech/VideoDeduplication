import useLoadAllTemplates from "./useLoadAllTemplates";
import { useMemo } from "react";
import { DefaultTemplateFilters } from "../../state/templates/queries/initialState";

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
 * @param {TemplateFilters} params
 * @return {(Map<(string|number), TemplateEntity>)}
 */
export default function useTemplateIndex(params = DefaultTemplateFilters) {
  const { templates } = useLoadAllTemplates(params);
  return useMemo(() => indexTemplates(templates), [templates]);
}
