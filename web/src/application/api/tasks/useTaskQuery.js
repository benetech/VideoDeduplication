import { DefaultTaskFilters } from "../../state/tasks/queries/initialState";
import { useDispatch, useSelector } from "react-redux";
import { selectTaskQuery } from "../../state/root/selectors";
import { useCallback, useEffect } from "react";
import {
  acquireTaskQuery,
  queryTasks,
  releaseTaskQuery,
} from "../../state/tasks/queries/actions";
import useValue from "../../../lib/hooks/useValue";

/**
 * @typedef {{
 *   tasks: TaskEntity[],
 *   total: number|undefined,
 *   error: boolean,
 *   loading: boolean,
 *   hasMore: boolean,
 *   canLoad: boolean,
 *   load: function,
 *   params: TaskFilters,
 * }} TaskQueryAPI
 */

/**
 * Use lazy templates query.
 *
 * @param {TaskFilters} params query filters
 * @return {TaskQueryAPI} files query.
 */
export default function useTaskQuery(params = DefaultTaskFilters) {
  params = useValue(params);
  const dispatch = useDispatch();
  const query = useSelector(selectTaskQuery(params));

  // Acquire and release query
  useEffect(() => {
    dispatch(acquireTaskQuery(params));
    return () => dispatch(releaseTaskQuery(params));
  }, [params]);

  // Loading trigger
  const load = useCallback(() => dispatch(queryTasks(params)), [params]);

  const hasMore = query?.total == null || query?.total > query?.items?.length;
  const canLoad = hasMore && query?.request == null;

  return {
    tasks: query?.items || [],
    total: query?.total,
    error: query != null && query.requestError,
    loading: query?.request != null,
    hasMore,
    canLoad,
    load,
    params,
  };
}
