import { useMutation, useQueryClient } from "react-query";
import { useServer } from "../../../server-api/context";
import collectQueriesData from "../../common/react-query/collectQueriesData";
import PagedResultsBuilder from "../../common/react-query/PagedResultsBuilder";
import { stringComparator } from "../../../lib/helpers/comparators";

/**
 * Check if the exclusion satisfies query filters.
 * @param {{
 *   filters: TemplateExclusionFilters
 * }} request
 * @param {TemplateExclusionEntity} exclusion
 */
function checkFilters(request, exclusion) {
  const { filters } = request;
  if (
    filters?.templateId != null &&
    exclusion.template.id !== filters.templateId
  ) {
    return false;
  }
  return filters?.fileId == null || exclusion.file.id === filters.fileId;
}

function makeComparator() {
  return (first, second) =>
    stringComparator(first.template.name, second.template.name);
}

/**
 * @typedef {{
 *   retry: number|undefined,
 * }} MutationOptions
 */

/**
 * Get a callback to create exclusion.
 * @param {MutationOptions} options
 * @return {{
 *   createExclusion: function
 * }}
 */
export function useCreateExclusion(options = {}) {
  const { retry = 5 } = options;
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (newExclusion) => server.templateExclusions.create(newExclusion),
    {
      onMutate: async (newExclusion) => {
        // Make sure optimistic updates will not be overwritten by any outgoing refetches
        await queryClient.cancelQueries([
          "template-file-exclusions",
          { fileId: newExclusion.file.id },
        ]);

        // Collect old data
        const originalData = new Map();
        collectQueriesData(queryClient, originalData, [
          ["template-file-exclusions", { fileId: newExclusion.file.id }],
        ]);

        const updater = (data) =>
          new PagedResultsBuilder(data, checkFilters, makeComparator).addEntity(
            newExclusion
          ).results;

        // Perform optimistic updates
        queryClient.setQueriesData(
          ["template-file-exclusions", { fileId: newExclusion.file.id }],
          updater
        );

        return { originalData };
      },
      onSuccess: async (data, newExclusion) => {
        await Promise.all([
          queryClient.invalidateQueries([
            "template-file-exclusions",
            { fileId: newExclusion.file.id },
          ]),
          queryClient.invalidateQueries([
            "template_matches",
            { fileId: newExclusion.file.id },
          ]),
        ]);
      },
      onError: (error, variables, context) => {
        console.error("Create exclusion error", error);

        // Cancel optimistic updates
        context.originalData.forEach((data, exactKey) => {
          queryClient.setQueryData(exactKey, data);
        });
      },
      retry,
    }
  );

  return {
    createExclusion: mutation.mutateAsync,
  };
}

/**
 * Get a callback to delete exclusion.
 * @param {MutationOptions} options
 * @return {{
 *   deleteExclusion: function
 * }}
 */
export function useDeleteExclusion(options = {}) {
  const { retry = 5 } = options;
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (exclusion) => server.templateExclusions.delete(exclusion),
    {
      onMutate: async (exclusion) => {
        // Make sure optimistic updates will not be overwritten by any outgoing refetches
        await queryClient.cancelQueries([
          "template-file-exclusions",
          { fileId: exclusion.file.id },
        ]);

        // Collect old data
        const originalData = new Map();
        collectQueriesData(queryClient, originalData, [
          ["template-file-exclusions", { fileId: exclusion.file.id }],
        ]);

        const updater = (data) =>
          new PagedResultsBuilder(
            data,
            checkFilters,
            makeComparator
          ).deleteEntity(exclusion).results;

        // Perform optimistic updates
        queryClient.setQueriesData(
          ["template-file-exclusions", { fileId: exclusion.file.id }],
          updater
        );

        return { originalData };
      },
      onSuccess: async (data, newExclusion) => {
        await Promise.all([
          queryClient.invalidateQueries([
            "template-file-exclusions",
            { fileId: newExclusion.file.id },
          ]),
        ]);
      },
      onError: (error, variables, context) => {
        console.error("Create exclusion error", error);

        // Cancel optimistic updates
        context.originalData.forEach((data, exactKey) => {
          queryClient.setQueryData(exactKey, data);
        });
      },
      retry,
    }
  );

  return {
    deleteExclusion: mutation.mutateAsync,
  };
}

/**
 * Get exclusions API.
 * @param {MutationOptions} options
 * @return {{
 *   deleteExclusion: function,
 *   createExclusion: function,
 * }}
 */
export default function useExclusionAPI(options) {
  const { createExclusion } = useCreateExclusion(options);
  const { deleteExclusion } = useDeleteExclusion(options);
  return { createExclusion, deleteExclusion };
}
