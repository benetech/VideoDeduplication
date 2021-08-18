import { useEffect } from "react";
import useObjectsQuery from "./useObjectsQuery";
import queryProgress from "../../../lib/helpers/queryProgress";

/**
 * @typedef {{
 *   objects: ObjectEntity[],
 *   total: number|undefined,
 *   progress: number,
 *   done: boolean,
 *   loading: boolean,
 *   retry: function|undefined,
 * }} SelectAllObjectsAPI
 */

/**
 *
 * @param {TemplateMatchFilters} params
 * @return {SelectAllObjectsAPI}
 */
export default function useLoadAllObjects(params) {
  const query = useObjectsQuery(params);

  const shouldAutoload = !query.error && query.canLoad;
  useEffect(() => {
    if (shouldAutoload) {
      query.load();
    }
  }, [shouldAutoload]);

  const result = {
    objects: query.objects,
    total: query.total,
    done: query.total <= query.objects.length,
    progress: queryProgress(query.total, query.objects),
    loading: query.loading,
  };

  if (query.error && query.canLoad) {
    result.retry = query.load;
  }

  return result;
}
