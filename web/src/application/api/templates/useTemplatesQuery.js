import { useDispatch, useSelector } from "react-redux";
import { selectTemplatesQuery } from "../../state/root/selectors";
import { useCallback, useEffect } from "react";
import { DefaultTemplateFilters } from "../../state/templates/queries/initialState";
import {
  acquireTemplatesQuery,
  queryTemplates,
  releaseTemplatesQuery,
} from "../../state/templates/queries/actions";

/**
 * @typedef {{
 *   templates: TemplateEntity[],
 *   total: number|undefined,
 *   error: boolean,
 *   loading: boolean,
 *   hasMore: boolean,
 *   canLoad: boolean,
 *   load: function,
 * }} SingleTemplatesQueryAPI
 */

/**
 * Use lazy templates query.
 *
 * @param {TemplateFilters} params query filters
 * @return {SingleTemplatesQueryAPI} files query.
 */
export default function useTemplatesQuery(params = DefaultTemplateFilters) {
  const dispatch = useDispatch();
  const query = useSelector(selectTemplatesQuery(params));

  // Acquire and release query
  useEffect(() => {
    dispatch(acquireTemplatesQuery(params));
    return () => dispatch(releaseTemplatesQuery(params));
  }, [params]);

  // Loading trigger
  const load = useCallback(() => dispatch(queryTemplates(params)), [params]);

  const hasMore = query?.total == null || query?.total > query?.items?.length;
  const canLoad = hasMore && query?.request == null;

  return {
    templates: query?.items || [],
    total: query?.total,
    error: query != null && query.requestError,
    loading: query?.request != null,
    hasMore,
    canLoad,
    load,
  };
}
