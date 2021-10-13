import { Entity, Transient, Updates } from "../../lib/entity/Entity";
import { ComparatorFn } from "../../lib/helpers/comparators";

/**
 * Single entity query results.
 */
export type EntityQueryResults = {
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
};

/**
 * Lazy (paged, infinite) query results.
 */
export type LazyQueryResults<TPage> = {
  pages: TPage[];
  total: number;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<any>;
  refetch: () => void;
  canLoad: boolean;
};

/**
 * Basic eager query API.
 */
export type EagerQueryAPI = {
  error: Error | null;
  total: number;
  resumeLoading: () => Promise<any>;
  hasMore: boolean;
  progress: number;
  done: boolean;
};

/**
 * Eager query results.
 */
export type EagerQueryResults<TEntity extends Entity> = EagerQueryAPI & {
  items: TEntity[];
};

/**
 * Common list-query options.
 */
export type QueryOptions = {
  limit?: number;
  fields?: string[];
};

/**
 * Common mutation options.
 */
export type MutationOptions = {
  retry?: number;
};

/**
 * Basic type for function that checks that some entity satisfies query filters.
 * Filter-checking is used for optimistic query updates.
 */
export type FilterCheckerFn<TEntity, TRequest> = (
  request: TRequest,
  entity: TEntity
) => boolean;

/**
 * Build entity comparator from query request.
 * Such comparator might be useful for optimistic query updates
 * when sorting criteria depends on query parameters.
 */
export type ComparatorFactoryFn<TEntity, TRequest> = (
  request: TRequest
) => ComparatorFn<TEntity>;

/**
 * Function that creates a new entity.
 */
export type CreateFn<E extends Entity, Proto = Transient<E>> = (
  prototype: Proto
) => Promise<E>;
/**
 * Function that updates existing entity.
 */
export type UpdateFn<E extends Entity, TUpdates = Updates<E>> = (
  entity: TUpdates
) => Promise<E>;
/**
 * Function that performs predefined update on existing entity.
 */
export type PredefinedUpdateFn<E extends Entity> = (
  entity: E | E["id"]
) => Promise<E>;
/**
 * Function that deletes existing entity.
 */
export type DeleteFn<E extends Entity> = (entity: E | E["id"]) => Promise<void>;
/**
 * Error handler function.
 */
export type ErrorHandler = (error: Error) => void;
/**
 * Operation with results.
 */
export type AsyncOperation<T> = (data: T) => Promise<void>;
