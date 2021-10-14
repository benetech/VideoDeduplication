import { QueryClient, QueryKey } from "react-query";

/**
 * Collect queries data in the store.
 */
export default function collectQueriesData<TData = unknown>(
  queryClient: QueryClient,
  store: Map<QueryKey, TData>,
  queryKeys: QueryKey[]
): void {
  queryKeys.forEach((queryKey) => {
    queryClient
      .getQueriesData<TData>(queryKey)
      .forEach(([exactKey, data]) => store.set(exactKey, data));
  });
}
