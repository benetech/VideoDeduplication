import { useMemo } from "react";
import useTemplatesAll from "./useTemplatesAll";
import DefaultTemplateFilters from "./helpers/DefaultTemplateFilters";
import { Template } from "../../../model/Template";
import indexEntities from "../../../lib/entity/indexEntities";

/**
 * Get id=>template index of the templates satisfying the given query params.
 */
export default function useTemplateIndex(
  filters = DefaultTemplateFilters
): Map<Template["id"], Template> {
  const { templates } = useTemplatesAll(filters);
  return useMemo(() => indexEntities(templates), [templates]);
}
