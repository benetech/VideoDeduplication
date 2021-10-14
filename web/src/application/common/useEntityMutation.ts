import {
  InfiniteData,
  QueryKey,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "react-query";
import collectQueriesData from "./collectQueriesData";
import PagedResultsBuilder from "./PagedResultsBuilder";
import { Entity, Transient, Updates } from "../../lib/entity/Entity";
import { ListRequest, ListResults } from "../../server-api/ServerAPI";
import {
  AsyncOperation,
  ComparatorFactoryFn,
  CreateFn,
  DeleteFn,
  ErrorHandler,
  FilterCheckerFn,
  PredefinedUpdateFn,
  UpdateFn,
} from "./model";

/**
 * Resolve data into query keys array.
 */
export type QueryKeyResolver<T> = (data: T) => QueryKey[];

/**
 * Determine if the argument is a query-keys resolver function.
 */
function isQueryKeyResolver<T>(
  keys: QueryKey[] | QueryKeyResolver<T>
): keys is QueryKeyResolver<T> {
  return typeof keys === "function";
}

/**
 * Resolve query keys.
 */
function resolveKeys<T>(
  data: T,
  keys: QueryKey[] | QueryKeyResolver<T>
): QueryKey[] {
  if (isQueryKeyResolver(keys)) {
    return keys(data);
  } else {
    return keys;
  }
}

/**
 * Default error handler for generic mutations.
 */
const DefaultErrorHandler = console.error;

/**
 * Mutation context to hold original data of optimistically updated queries.
 */
export type MutationContext<TData> = {
  originalData: Map<QueryKey, InfiniteData<TData>>;
};

/**
 * Arguments of the `useCreateEntity` hook.
 */
type CreateEntityOptions<
  TEntity extends Entity,
  TFilters = unknown,
  TRequest extends ListRequest<TFilters> = ListRequest<TFilters>,
  TProto = Transient<TEntity>
> = {
  createFn: CreateFn<TEntity, TProto>;
  checkFilters: FilterCheckerFn<TEntity, TRequest>;
  makeComparator: ComparatorFactoryFn<TEntity, TRequest>;
  updateKeys?: QueryKey[] | QueryKeyResolver<TEntity>;
  invalidateKeys?: QueryKey[] | QueryKeyResolver<TEntity>;
  handleError?: ErrorHandler;
};

/**
 * Generic implementation of create-entity mutation.
 *
 * @param createFn
 * @param checkFilters function to check if the entity satisfies query filters
 * @param makeComparator create sort comparator from query request
 * @param updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param invalidateKeys query keys that should be invalidated upon success
 * @param handleError function to handle error (`console.error` by default)
 */
export function useCreateEntity<
  TEntity extends Entity,
  TFilters = unknown,
  TData extends ListResults<TEntity, TFilters> = ListResults<TEntity, TFilters>,
  TProto = Transient<TEntity>
>({
  createFn,
  checkFilters,
  makeComparator,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = DefaultErrorHandler,
}: CreateEntityOptions<
  TEntity,
  TFilters,
  TData["request"],
  TProto
>): UseMutationResult<TEntity, Error, TProto> {
  const queryClient = useQueryClient();

  // Create updater factory
  const makeUpdater =
    (newEntity: TEntity) => (data: InfiniteData<TData> | undefined) =>
      new PagedResultsBuilder<TEntity, TFilters, TData>(
        data,
        checkFilters,
        makeComparator
      ).addEntity(newEntity).results as InfiniteData<TData>;

  return useMutation<TEntity, Error, TProto>(createFn, {
    onSuccess: async (entity) => {
      // Update queries using the created entity
      const updater = makeUpdater(entity);
      const resolvedUpdateKeys = resolveKeys(entity, updateKeys);
      for (const updateKey of resolvedUpdateKeys) {
        queryClient.setQueriesData<InfiniteData<TData>>(updateKey, updater);
      }

      // Always invalidate relevant queries in the background
      const resolvedInvalidateKeys = resolveKeys(entity, invalidateKeys);
      await Promise.all(
        resolvedInvalidateKeys.map((queryKey) =>
          queryClient.invalidateQueries(queryKey)
        )
      );
    },
    onError: handleError,
  });
}

/**
 * Arguments of the `useUpdateEntity` hook.
 */
type UpdateEntityOptions<
  TEntity extends Entity,
  TFilters = unknown,
  TRequest extends ListRequest<TFilters> = ListRequest<TFilters>,
  TUpdates = Updates<TEntity>
> = {
  updateFn: UpdateFn<TEntity, TUpdates>;
  checkFilters: FilterCheckerFn<TEntity, TRequest>;
  makeComparator: ComparatorFactoryFn<TEntity, TRequest>;
  updateKeys?: QueryKey[] | QueryKeyResolver<TUpdates>;
  invalidateKeys?: QueryKey[] | QueryKeyResolver<TUpdates>;
  handleError?: ErrorHandler;
  optimistic?: boolean;
};

/**
 * Generic implementation of update-entity mutation.
 *
 * @param updateFn
 * @param checkFilters function to check if the entity satisfies query filters
 * @param makeComparator create sort comparator from query request
 * @param updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param invalidateKeys query keys that should be invalidated upon success
 * @param handleError function to handle error (`console.error` by default)
 * @param optimistic indicates that optimistic update should be performed
 */
export function useUpdateEntity<
  TEntity extends Entity,
  TFilters = unknown,
  TData extends ListResults<TEntity, TFilters> = ListResults<TEntity, TFilters>,
  TUpdates extends Updates<TEntity> = Updates<TEntity>
>({
  updateFn,
  checkFilters,
  makeComparator,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = DefaultErrorHandler,
  optimistic = true,
}: UpdateEntityOptions<
  TEntity,
  TFilters,
  TData["request"],
  TUpdates
>): UseMutationResult<TEntity, Error, TUpdates> {
  const queryClient = useQueryClient();

  // Define optimistic updater factory
  const makeOptimisticUpdater =
    (updates: TUpdates) => (data: InfiniteData<TData> | undefined) =>
      new PagedResultsBuilder<TEntity, TFilters, TData>(
        data,
        checkFilters,
        makeComparator
      ).updateEntity(updates.id, (entity: TEntity) =>
        Object.assign({}, entity, updates)
      ).results as InfiniteData<TData>;

  // Define post-update factory
  const makePostUpdater =
    (entity: TEntity) => (data: InfiniteData<TData> | undefined) =>
      new PagedResultsBuilder<TEntity, TFilters, TData>(
        data,
        checkFilters,
        makeComparator
      ).updateEntity(entity, () => entity).results as InfiniteData<TData>;

  return useMutation<TEntity, Error, TUpdates, MutationContext<TData>>(
    updateFn,
    {
      onMutate: async (updates: TUpdates) => {
        const originalData = new Map<QueryKey, InfiniteData<TData>>();

        if (optimistic) {
          // Make sure optimistic updates will not be overwritten by any outgoing refetches
          const resolvedUpdateKeys = resolveKeys(updates, updateKeys);
          await Promise.all(
            resolvedUpdateKeys.map((queryKey) =>
              queryClient.cancelQueries(queryKey)
            )
          );

          // Collect original data to be able to roll back optimistic updates
          collectQueriesData(queryClient, originalData, resolvedUpdateKeys);

          // Perform optimistic updates
          const updater = makeOptimisticUpdater(updates);
          for (const updateKey of resolvedUpdateKeys) {
            queryClient.setQueriesData(updateKey, updater);
          }
        }

        return { originalData };
      },
      onSuccess: async (updated: TEntity, updates: TUpdates) => {
        // Update query data using the mutation results
        const updater = makePostUpdater(updated);
        const resolvedUpdateKeys = resolveKeys(updates, updateKeys);
        for (const updateKey of resolvedUpdateKeys) {
          queryClient.setQueriesData(updateKey, updater);
        }

        // Always invalidate relevant queries in the background
        const resolvedInvalidateKeys = resolveKeys(updates, invalidateKeys);
        await Promise.all(
          resolvedInvalidateKeys.map((queryKey) =>
            queryClient.invalidateQueries(queryKey)
          )
        );
      },
      onError: (error, variables, context) => {
        handleError(error);
        // Roll back optimistic updates
        if (context != null) {
          context.originalData.forEach((data, exactKey) => {
            queryClient.setQueryData(exactKey, data);
          });
        }
      },
    }
  );
}

/**
 * Arguments of the `usePredefinedUpdateEntity` hook.
 */
type PredefinedUpdateEntityOptions<
  TEntity extends Entity,
  TFilters = unknown,
  TRequest extends ListRequest<TFilters> = ListRequest<TFilters>
> = {
  updateFn: PredefinedUpdateFn<TEntity>;
  checkFilters: FilterCheckerFn<TEntity, TRequest>;
  makeComparator: ComparatorFactoryFn<TEntity, TRequest>;
  updateKeys?: QueryKey[] | QueryKeyResolver<TEntity>;
  invalidateKeys?: QueryKey[] | QueryKeyResolver<TEntity>;
  handleError?: ErrorHandler;
};

/**
 * Generic implementation of predefined entity update mutation.
 *
 * @param updateFn
 * @param checkFilters function to check if the entity satisfies query filters
 * @param makeComparator create sort comparator from query request
 * @param updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param invalidateKeys query keys that should be invalidated upon success
 * @param handleError function to handle error (`console.error` by default)
 * @param optimistic indicates that optimistic update should be performed
 */
export function usePredefinedUpdateEntity<
  TEntity extends Entity,
  TFilters = unknown,
  TData extends ListResults<TEntity, TFilters> = ListResults<TEntity, TFilters>
>({
  updateFn,
  checkFilters,
  makeComparator,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = DefaultErrorHandler,
}: PredefinedUpdateEntityOptions<
  TEntity,
  TFilters,
  TData["request"]
>): UseMutationResult<TEntity, Error, TEntity | TEntity["id"]> {
  const queryClient = useQueryClient();

  // Define post-update factory
  const makePostUpdater =
    (entity: TEntity) => (data: InfiniteData<TData> | undefined) =>
      new PagedResultsBuilder<TEntity, TFilters, TData>(
        data,
        checkFilters,
        makeComparator
      ).updateEntity(entity, () => entity).results as InfiniteData<TData>;

  return useMutation<TEntity, Error, TEntity | TEntity["id"]>(updateFn, {
    onSuccess: async (updated: TEntity) => {
      // Update query data using the mutation results
      const updater = makePostUpdater(updated);
      const resolvedUpdateKeys = resolveKeys(updated, updateKeys);
      for (const updateKey of resolvedUpdateKeys) {
        queryClient.setQueriesData(updateKey, updater);
      }

      // Always invalidate relevant queries in the background
      const resolvedInvalidateKeys = resolveKeys(updated, invalidateKeys);
      await Promise.all(
        resolvedInvalidateKeys.map((queryKey) =>
          queryClient.invalidateQueries(queryKey)
        )
      );
    },
    onError: handleError,
  });
}

/**
 * Arguments of the `useDeleteEntity` hook.
 */
type DeleteEntityOptions<
  TEntity extends Entity,
  TFilters = unknown,
  TRequest extends ListRequest<TFilters> = ListRequest<TFilters>
> = {
  deleteFn: DeleteFn<TEntity>;
  checkFilters: FilterCheckerFn<TEntity, TRequest>;
  makeComparator: ComparatorFactoryFn<TEntity, TRequest>;
  updateKeys?: QueryKey[] | QueryKeyResolver<TEntity | TEntity["id"]>;
  invalidateKeys?: QueryKey[] | QueryKeyResolver<TEntity | TEntity["id"]>;
  handleError?: ErrorHandler;
  optimistic?: boolean;
};

/**
 * Generic implementation of delete-entity mutation.
 *
 * @param deleteFn
 * @param checkFilters function to check if the entity satisfies query filters
 * @param makeComparator create sort comparator from query request
 * @param updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param invalidateKeys query keys that should be invalidated upon success
 * @param handleError function to handle error (`console.error` by default)
 * @param optimistic indicates that optimistic update should be performed
 */
export function useDeleteEntity<
  TEntity extends Entity,
  TFilters = unknown,
  TData extends ListResults<TEntity, TFilters> = ListResults<TEntity, TFilters>
>({
  deleteFn,
  checkFilters,
  makeComparator,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = DefaultErrorHandler,
  optimistic = true,
}: DeleteEntityOptions<TEntity, TFilters, TData["request"]>): UseMutationResult<
  void,
  Error,
  TEntity | TEntity["id"]
> {
  const queryClient = useQueryClient();

  // Prepare optimistic updater factory
  const makeUpdater =
    (entity: TEntity | TEntity["id"]) => (data?: InfiniteData<TData>) =>
      new PagedResultsBuilder<TEntity, TFilters, TData>(
        data,
        checkFilters,
        makeComparator
      ).deleteEntity(entity).results as InfiniteData<TData>;

  return useMutation<
    void,
    Error,
    TEntity | TEntity["id"],
    MutationContext<TData>
  >(deleteFn, {
    onMutate: async (deleted: TEntity | TEntity["id"]) => {
      const originalData = new Map<QueryKey, InfiniteData<TData>>();

      if (optimistic) {
        // Make sure optimistic updates will not be overwritten by any outgoing refetches
        const resolvedUpdateKeys = resolveKeys(deleted, updateKeys);
        await Promise.all(
          resolvedUpdateKeys.map((queryKey) =>
            queryClient.cancelQueries(queryKey)
          )
        );

        // Collect original data to be able to roll back optimistic updates
        collectQueriesData(queryClient, originalData, resolvedUpdateKeys);

        // Perform optimistic updates
        const updater = makeUpdater(deleted);
        for (const updateKey of resolvedUpdateKeys) {
          queryClient.setQueriesData(updateKey, updater);
        }
      }

      return { originalData };
    },
    onSuccess: async (nothing, deleted: TEntity | TEntity["id"]) => {
      // Always invalidate relevant queries in the background
      const resolvedInvalidateKeys = resolveKeys(deleted, invalidateKeys);
      await Promise.all(
        resolvedInvalidateKeys.map((queryKey) =>
          queryClient.invalidateQueries(queryKey)
        )
      );
    },
    onError: (error, variables, context) => {
      handleError(error);

      // Roll back optimistic updates
      if (context != null) {
        context.originalData.forEach((data, exactKey) => {
          queryClient.setQueryData(exactKey, data);
        });
      }
    },
  });
}

/**
 * Arguments of the `useDeleteFullEntity` hook.
 */
type DeleteFullEntityOptions<
  TEntity extends Entity,
  TFilters = unknown,
  TRequest extends ListRequest<TFilters> = ListRequest<TFilters>
> = {
  deleteFn: AsyncOperation<TEntity>;
  checkFilters: FilterCheckerFn<TEntity, TRequest>;
  makeComparator: ComparatorFactoryFn<TEntity, TRequest>;
  updateKeys?: QueryKey[] | QueryKeyResolver<TEntity>;
  invalidateKeys?: QueryKey[] | QueryKeyResolver<TEntity>;
  handleError?: ErrorHandler;
  optimistic?: boolean;
};

/**
 * Generic implementation of delete-full-entity mutation.
 *
 * @param deleteFn
 * @param checkFilters function to check if the entity satisfies query filters
 * @param makeComparator create sort comparator from query request
 * @param updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param invalidateKeys query keys that should be invalidated upon success
 * @param handleError function to handle error (`console.error` by default)
 * @param optimistic indicates that optimistic update should be performed
 */
export function useDeleteFullEntity<
  TEntity extends Entity,
  TFilters = unknown,
  TData extends ListResults<TEntity, TFilters> = ListResults<TEntity, TFilters>
>({
  deleteFn,
  checkFilters,
  makeComparator,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = DefaultErrorHandler,
  optimistic = true,
}: DeleteFullEntityOptions<
  TEntity,
  TFilters,
  TData["request"]
>): UseMutationResult<void, Error, TEntity> {
  const queryClient = useQueryClient();

  // Prepare optimistic updater factory
  const makeUpdater =
    (entity: TEntity | TEntity["id"]) => (data?: InfiniteData<TData>) =>
      new PagedResultsBuilder<TEntity, TFilters, TData>(
        data,
        checkFilters,
        makeComparator
      ).deleteEntity(entity).results as InfiniteData<TData>;

  return useMutation<void, Error, TEntity, MutationContext<TData>>(deleteFn, {
    onMutate: async (deleted: TEntity) => {
      const originalData = new Map<QueryKey, InfiniteData<TData>>();

      if (optimistic) {
        // Make sure optimistic updates will not be overwritten by any outgoing refetches
        const resolvedUpdateKeys = resolveKeys(deleted, updateKeys);
        await Promise.all(
          resolvedUpdateKeys.map((queryKey) =>
            queryClient.cancelQueries(queryKey)
          )
        );

        // Collect original data to be able to roll back optimistic updates
        collectQueriesData(queryClient, originalData, resolvedUpdateKeys);

        // Perform optimistic updates
        const updater = makeUpdater(deleted);
        for (const updateKey of resolvedUpdateKeys) {
          queryClient.setQueriesData(updateKey, updater);
        }
      }

      return { originalData };
    },
    onSuccess: async (nothing, deleted: TEntity) => {
      // Always invalidate relevant queries in the background
      const resolvedInvalidateKeys = resolveKeys(deleted, invalidateKeys);
      await Promise.all(
        resolvedInvalidateKeys.map((queryKey) =>
          queryClient.invalidateQueries(queryKey)
        )
      );
    },
    onError: (error, variables, context) => {
      handleError(error);

      // Roll back optimistic updates
      if (context != null) {
        context.originalData.forEach((data, exactKey) => {
          queryClient.setQueryData(exactKey, data);
        });
      }
    },
  });
}
