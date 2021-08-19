import { useDispatch, useSelector } from "react-redux";
import { selectObjectsQuery } from "../../state/root/selectors";
import { useCallback, useEffect } from "react";
import {
  acquireObjectsQuery,
  queryObjects,
  releaseObjectsQuery,
} from "../../state/objects/queries/actions";
import useValue from "../../../lib/hooks/useValue";

/**
 * @typedef {{
 *   objects: ObjectEntity[],
 *   total: number|undefined,
 *   error: boolean,
 *   loading: boolean,
 *   hasMore: boolean,
 *   canLoad: boolean,
 *   load: function,
 *   params: TemplateMatchFilters,
 * }} ObjectsQueryAPI
 */

/**
 * Use lazy objects query.
 *
 * @param {TemplateMatchFilters} params query filters
 * @return {ObjectsQueryAPI} files query.
 */
export default function useObjectsQuery(params) {
  const dispatch = useDispatch();
  const query = useSelector(selectObjectsQuery(params));
  params = useValue(params);

  // Acquire and release query
  useEffect(() => {
    dispatch(acquireObjectsQuery(params));
    return () => dispatch(releaseObjectsQuery(params));
  }, [params]);

  // Loading trigger
  const load = useCallback(() => dispatch(queryObjects(params)), [params]);

  const hasMore = query?.total == null || query?.total > query?.items?.length;
  const canLoad = hasMore && query?.request == null;

  return {
    objects: query?.items || [],
    total: query?.total,
    error: query != null && query.requestError,
    loading: query?.request != null,
    hasMore,
    canLoad,
    load,
    params,
  };
}
