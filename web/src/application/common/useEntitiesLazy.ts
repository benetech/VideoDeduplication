import { useMemo } from "react";
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "react-query";
import { LazyQueryResults } from "./model";
import { BaseListResults, ListResults } from "../../server-api/ServerAPI";
import { Entity } from "../../lib/entity/Entity";

export type UseEntitiesLazyOptions<
  TPage,
  TData extends ListResults<any, any>
> = {
  makePages?: (query: UseInfiniteQueryResult<TData>) => TPage[];
  getTotal?: (lastPage: TData | undefined) => number;
  getOffset?: (lastPage: TData) => number;
};

export type UseBasicEntitiesLazyOptions<
  TPage,
  TData extends BaseListResults
> = {
  makePages: (query: UseInfiniteQueryResult<TData>) => TPage[];
  getTotal?: (lastPage: TData | undefined) => number;
  getOffset: (lastPage: TData) => number;
};

export type UseEntitiesLazyResults<TPage, TData = unknown> = {
  results: LazyQueryResults<TPage>;
  query: UseInfiniteQueryResult<TData, Error>;
};

function getLastPage<TData extends BaseListResults>(
  query: UseInfiniteQueryResult<TData>
): TData | undefined {
  const pages: TData[] = query.data?.pages || [];
  if (pages.length > 0) {
    return pages[pages.length - 1];
  }
  return undefined;
}

function getTotalDefault<TData extends BaseListResults>(
  lastPage: TData | undefined
): number {
  if (lastPage != null) {
    return lastPage.total;
  }
  return 0;
}

export function useBasicEntitiesLazy<
  TPage,
  TData extends BaseListResults = BaseListResults
>(
  queryKey: QueryKey,
  fetchFn: (context?: any) => Promise<TData>,
  options: UseBasicEntitiesLazyOptions<TPage, TData>
): UseEntitiesLazyResults<TPage, TData> {
  const { getTotal = getTotalDefault, makePages, getOffset } = options;
  const query = useInfiniteQuery<TData, Error>(queryKey, fetchFn, {
    keepPreviousData: true,
    getNextPageParam: (lastPage) => {
      if (lastPage == null) {
        return 0;
      }
      const nextOffset = getOffset(lastPage);
      const total = getTotal(lastPage);
      if (nextOffset < total) {
        return nextOffset;
      }
    },
  });

  const pages = useMemo(() => makePages(query), [query.data?.pages]);

  const isLoading = query.isFetchingNextPage;
  const canLoad = Boolean(query.hasNextPage) && !isLoading;

  return {
    results: {
      pages,
      total: getTotal(getLastPage(query)),
      error: query.error,
      isLoading,
      isError: query.isError,
      hasNextPage: !!query.hasNextPage || query.isLoading,
      fetchNextPage: query.fetchNextPage,
      refetch: query.fetchNextPage,
      canLoad,
    },
    query,
  };
}

export default function useEntitiesLazy<
  TEntity extends Entity,
  TFilters = unknown,
  TData extends ListResults<TEntity, TFilters> = ListResults<TEntity, TFilters>
>(
  queryKey: QueryKey,
  fetchFn: (context?: any) => Promise<TData>,
  options: UseEntitiesLazyOptions<TEntity[], TData> = {}
): UseEntitiesLazyResults<TEntity[], TData> {
  const {
    makePages = (query: UseInfiniteQueryResult<TData>): TEntity[][] =>
      (query.data?.pages || []).map((page) => page.items),
    getOffset = (lastPage: TData): number =>
      (lastPage.request.offset || 0) + lastPage.items.length,
    getTotal = getTotalDefault,
  } = options;

  return useBasicEntitiesLazy<TEntity[], TData>(queryKey, fetchFn, {
    makePages,
    getOffset,
    getTotal,
  });
}
