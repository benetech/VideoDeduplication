import { useDispatch, useSelector } from "react-redux";
import { selectFilesQuery } from "../../state/root/selectors";
import { useCallback, useEffect } from "react";
import {
  acquireFilesQuery,
  queryFiles,
  releaseFilesQuery,
} from "../../state/files/queries/actions";
import { MatchCategory } from "../../state/files/queries/MatchCategory";

/**
 * Use lazy files query.
 * @param {FileFilters} params query filters
 * @return {{
 *   files: FileEntity[],
 *   counts: {
 *     all: number,
 *     related: number,
 *     duplicates: number,
 *     unique: number
 *   },
 *   error: boolean,
 *   loading: boolean,
 *   hasMore: boolean,
 *   canLoad: boolean,
 *   load: function,
 * }} files query.
 */
export default function useFilesQuery(params) {
  const dispatch = useDispatch();
  const query = useSelector(selectFilesQuery(params));

  // Acquire and release query
  useEffect(() => {
    dispatch(acquireFilesQuery(params));
    return () => dispatch(releaseFilesQuery(params));
  }, [params]);

  // Loading trigger
  const load = useCallback(() => dispatch(queryFiles(params)), [params]);

  const hasMore = query?.total == null || query?.total > query?.items?.length;
  const canLoad = hasMore && query?.request == null;

  return {
    files: query?.items || [],
    counts: query?.data?.counts || {
      [MatchCategory.all]: 0,
      [MatchCategory.duplicates]: 0,
      [MatchCategory.related]: 0,
      [MatchCategory.unique]: 0,
    },
    error: query != null && query.requestError,
    loading: query?.request != null,
    hasMore,
    canLoad,
    load,
  };
}
