import { useServer } from "../../../server-api/context";
import { useMutation, useQueryClient } from "react-query";
import collectQueriesData from "../../common/react-query/collectQueriesData";
import PagedResultsBuilder from "../../common/react-query/PagedResultsBuilder";

/**
 * Check if the object satisfies query params.
 * @param {{
 *   filters: TemplateMatchFilters
 * }} request
 * @param {ObjectEntity} object
 * @return {boolean}
 */
function checkFilters(request, object) {
  const { filters } = request;
  if (filters.fileId != null && object.fileId !== filters.fileId) {
    return false;
  }
  return !(
    filters.templateId != null && object.templateId !== filters.templateId
  );
}

/**
 * Compare objects by start time.
 * @param {ObjectEntity} objectA
 * @param {ObjectEntity} objectB
 * @return {number}
 */
function startTimeComparator(objectA, objectB) {
  return objectA.start - objectB.start;
}

/**
 * Create objects sort comparator from query params.
 * @return {(function(ObjectEntity,ObjectEntity): number)}
 */
function makeComparator() {
  return startTimeComparator;
}

/**
 * Get a callback to update match.
 * @param {MutationOptions} options
 * @return {{
 *   updateObject: function
 * }}
 */
export default function useUpdateObject(options = {}) {
  const { retry = 5 } = options;
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (updatedObject) => server.templateMatches.update(updatedObject),
    {
      onMutate: async (object) => {
        // Make sure optimistic updates will not be overwritten by any outgoing refetches
        await queryClient.cancelQueries([
          "template_matches",
          { fileId: object.fileId },
        ]);

        // Collect old data
        const originalData = new Map();
        collectQueriesData(queryClient, originalData, [
          ["template_matches", { fileId: object.fileId }],
        ]);

        const updater = (data) =>
          new PagedResultsBuilder(
            data,
            checkFilters,
            makeComparator
          ).updateEntity(object, () => object).results;

        // Perform optimistic updates
        queryClient.setQueriesData(
          ["template_matches", { fileId: object.fileId }],
          updater
        );

        return { originalData };
      },
      onSuccess: async (data, match) => {
        await Promise.all([
          queryClient.invalidateQueries([
            "template_matches",
            { fileId: match.fileId },
          ]),
        ]);
      },
      onError: (error, variables, context) => {
        console.error("Object update failed", error);

        // Cancel optimistic updates
        context.originalData.forEach((data, exactKey) => {
          queryClient.setQueryData(exactKey, data);
        });
      },
      retry,
    }
  );

  return {
    updateObject: mutation.mutateAsync,
  };
}
