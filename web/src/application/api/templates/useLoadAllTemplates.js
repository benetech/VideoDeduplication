import { DefaultTemplateFilters } from "../../state/templates/queries/initialState";
import useTemplatesQuery from "./useTemplatesQuery";
import { useEffect } from "react";

/**
 * Get current progress.
 * @param {SingleTemplatesQueryAPI} query
 * @return {number} loading progress from [0, 1]
 */
function progress(query) {
  if (query.total == null) {
    return 0;
  }
  if (query.total === query.templates.length) {
    return 1;
  }
  return query.templates.length / query.total;
}

/**
 *
 * @param {TemplateFilters} params
 * @return {{
 *   templates: TemplateType[],
 *   total: number|undefined,
 *   progress: number,
 *   done: boolean,
 *   loading: boolean,
 *   retry: function|undefined,
 * }}
 */
export default function useLoadAllTemplates(params = DefaultTemplateFilters) {
  const query = useTemplatesQuery(params);

  const shouldAutoload = !query.error && query.canLoad;
  useEffect(() => {
    if (shouldAutoload) {
      query.load();
    }
  }, [shouldAutoload]);

  const result = {
    templates: query.templates,
    total: query.total,
    done: query.total === query.templates.length,
    progress: progress(query),
    loading: query.loading,
  };

  if (query.error && query.canLoad) {
    result.retry = query.load;
  }

  return result;
}
