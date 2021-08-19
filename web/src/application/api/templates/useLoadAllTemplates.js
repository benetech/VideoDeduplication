import { DefaultTemplateFilters } from "../../state/templates/queries/initialState";
import useTemplatesQuery from "./useTemplatesQuery";
import { useEffect } from "react";
import queryProgress from "../../../lib/helpers/queryProgress";

/**
 *
 * @param {TemplateFilters} params
 * @return {{
 *   templates: TemplateEntity[],
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
  }, [shouldAutoload, query.params]);

  const result = {
    templates: query.templates,
    total: query.total,
    done: query.total <= query.templates.length,
    progress: queryProgress(query.total, query.templates),
    loading: query.loading,
  };

  if (query.error && query.canLoad) {
    result.retry = query.load;
  }

  return result;
}
