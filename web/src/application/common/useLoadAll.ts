import { useEffect, useMemo } from "react";
import { EagerQueryResults, LazyQueryResults } from "./model";
import { Entity } from "../../lib/entity/Entity";

export type UseBasicLoadAllOptions<TEntity, TPage> = {
  collectItems: (pages: LazyQueryResults<TPage>) => TEntity[];
};

export function useBasicLoadAll<TEntity extends Entity, TPage>(
  results: LazyQueryResults<TPage>,
  options: UseBasicLoadAllOptions<TEntity, TPage>
): EagerQueryResults<TEntity> {
  const { collectItems } = options;

  const items = useMemo(() => collectItems(results), [results.pages]);

  useEffect(() => {
    if (results.canLoad && !results.isError) {
      results.fetchNextPage();
    }
  }, [results.canLoad, results.isError, results.fetchNextPage]);

  return {
    items,
    total: results.total,
    error: results.error,
    progress: results.total > 0 ? items.length / results.total : 0,
    hasMore: results.hasNextPage,
    resumeLoading: results.fetchNextPage,
    done: !results.hasNextPage,
  };
}

/**
 * Fetch all items.
 */
export default function useLoadAll<TEntity extends Entity>(
  results: LazyQueryResults<TEntity[]>
): EagerQueryResults<TEntity> {
  const collectItems = (results: LazyQueryResults<TEntity[]>) =>
    ([] as TEntity[]).concat(...results.pages);
  return useBasicLoadAll<TEntity, TEntity[]>(results, {
    collectItems,
  });
}
