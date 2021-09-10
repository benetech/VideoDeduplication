import { useMutation, useQueryClient } from "react-query";
import collectQueriesData from "./collectQueriesData";
import PagedResultsBuilder from "./PagedResultsBuilder";

/**
 * Generic implementation of single entity mutation.
 * @param {function} mutationFn
 * @param {(function(Entity):function)} makeUpdaterFn use entity into function to update queries data.
 * @param {any[]} updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param {any[]} invalidateKeys query keys that should be invalidated upon success
 * @param {function} handleError function to handle error (`console.error` by default)
 * @param {boolean} optimistic indicates that optimistic update should be performed
 * @param {boolean} hasResults indicates that queries data should be updated using data returned by `mutationFn`
 * @returns {UseMutationResult<unknown, unknown, void, {originalData: *}>}
 */
export default function useEntityMutation({
  mutationFn,
  makeUpdaterFn,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = console.error,
  optimistic = true,
  hasResults = true,
}) {
  const queryClient = useQueryClient();
  return useMutation(mutationFn, {
    onMutate: async (entity) => {
      const originalData = new Map();

      if (optimistic) {
        // Make sure optimistic updates will not be overwritten by any outgoing refetches
        await Promise.all(
          updateKeys.map((queryKey) => queryClient.cancelQueries(queryKey))
        );

        // Collect original data to be able to roll back optimistic updates
        collectQueriesData(queryClient, originalData, updateKeys);

        // Perform optimistic updates
        queryClient.setQueriesData(updateKeys, makeUpdaterFn(entity));
      }

      return { originalData };
    },
    onSuccess: async (resultEntity) => {
      // Update query data using the mutation results
      if (hasResults) {
        queryClient.setQueriesData(updateKeys, makeUpdaterFn(resultEntity));
      }

      // Always invalidate relevant queries in the background
      await Promise.all(
        invalidateKeys.map((queryKey) =>
          queryClient.invalidateQueries(queryKey)
        )
      );
    },
    onError: (error, variables, context) => {
      handleError(error);

      // Roll back optimistic updates
      context.originalData.forEach((data, exactKey) => {
        queryClient.setQueryData(exactKey, data);
      });
    },
  });
}

/**
 * Generic implementation of create-entity mutation.
 * @param {function} mutationFn
 * @param {function} checkFilters function to check if the entity satisfies query filters
 * @param {function} makeComparator create sort comparator from query request
 * @param {any[]} updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param {any[]} invalidateKeys query keys that should be invalidated upon success
 * @param {function} handleError function to handle error (`console.error` by default)
 * @param {boolean} optimistic indicates that optimistic update should be performed
 * @param {boolean} hasResults indicates that queries data should be updated using data returned by `mutationFn`
 * @returns {UseMutationResult<*, *, void, {originalData: *}>}
 */
export function useCreateEntity({
  mutationFn,
  checkFilters,
  makeComparator,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = console.error,
  optimistic = true,
  hasResults = true,
}) {
  const insertEntity = (newEntity) => (data) =>
    new PagedResultsBuilder(data, checkFilters, makeComparator).addEntity(
      newEntity
    ).results;

  return useEntityMutation({
    mutationFn,
    makeUpdaterFn: insertEntity,
    updateKeys,
    invalidateKeys,
    handleError,
    optimistic,
    hasResults,
  });
}

/**
 * Generic implementation of update-entity mutation.
 * @param {function} mutationFn
 * @param {function} checkFilters function to check if the entity satisfies query filters
 * @param {function} makeComparator create sort comparator from query request
 * @param {any[]} updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param {any[]} invalidateKeys query keys that should be invalidated upon success
 * @param {function} handleError function to handle error (`console.error` by default)
 * @param {boolean} optimistic indicates that optimistic update should be performed
 * @param {boolean} hasResults indicates that queries data should be updated using data returned by `mutationFn`
 * @returns {UseMutationResult<*, *, void, {originalData: *}>}
 */
export function useUpdateEntity({
  mutationFn,
  checkFilters,
  makeComparator,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = console.error,
  optimistic = true,
  hasResults = true,
}) {
  const updateEntity = (updatedEntity) => (data) =>
    new PagedResultsBuilder(data, checkFilters, makeComparator).updateEntity(
      updatedEntity,
      () => updatedEntity
    ).results;

  return useEntityMutation({
    mutationFn,
    makeUpdaterFn: updateEntity,
    updateKeys,
    invalidateKeys,
    handleError,
    optimistic,
    hasResults,
  });
}

/**
 * Generic implementation of delete-entity mutation.
 * @param {function} mutationFn
 * @param {function} checkFilters function to check if the entity satisfies query filters
 * @param {function} makeComparator create sort comparator from query request
 * @param {any[]} updateKeys keys of the queries that should be updated (optimistically or using mutation results)
 * @param {any[]} invalidateKeys query keys that should be invalidated upon success
 * @param {function} handleError function to handle error (`console.error` by default)
 * @param {boolean} optimistic indicates that optimistic update should be performed
 * @param {boolean} hasResults indicates that queries data should be updated using data returned by `mutationFn`
 * @returns {UseMutationResult<*, *, void, {originalData: *}>}
 */
export function useDeleteEntity({
  mutationFn,
  checkFilters,
  makeComparator,
  updateKeys = [],
  invalidateKeys = updateKeys,
  handleError = console.error,
  optimistic = true,
  hasResults = false,
}) {
  const deleteEntity = (deletedEntity) => (data) =>
    new PagedResultsBuilder(data, checkFilters, makeComparator).deleteEntity(
      deletedEntity
    ).results;

  return useEntityMutation({
    mutationFn,
    makeUpdaterFn: deleteEntity,
    updateKeys,
    invalidateKeys,
    handleError,
    optimistic,
    hasResults,
  });
}
