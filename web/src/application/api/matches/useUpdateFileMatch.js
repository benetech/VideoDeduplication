import { useMutation, useQueryClient } from "react-query";
import { useServer } from "../../../server-api/context";
import collectQueriesData from "../../common/react-query/collectQueriesData";
import PagedResultsBuilder from "../../common/react-query/PagedResultsBuilder";

/**
 * Check if the file match satisfies query filters.
 * @param {{
 *   filters: FileMatchFilters
 * }} request
 * @param match file match
 */
function checkFilters(request, match) {
  const { filters } = request;
  if (filters?.remote != null && match.file.external !== filters.remote) {
    return false;
  }
  return (
    filters?.falsePositive == null ||
    match.falsePositive === filters.falsePositive
  );
}

function makeComparator(request) {
  return (first, second) => first.distance - second.distance;
}

/**
 * @typedef {{
 *   retry: number|undefined,
 * }} UpdateMatchOptions
 */

/**
 * Get a callback to update match.
 * @param {UpdateMatchOptions} options
 * @return {{
 *   updateMatch: function
 * }}
 */
export default function useUpdateFileMatch(options = {}) {
  const { retry = 5 } = options;
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (updatedMatch) => server.matches.update(updatedMatch),
    {
      onMutate: async (match) => {
        const { file, motherFile } = match;

        // Make sure optimistic updates will not be overwritten by any outgoing refetches
        await queryClient.cancelQueries(["files/matches", motherFile.id]);
        await queryClient.cancelQueries(["files/matches", file.id]);

        // Collect old data
        const originalData = new Map();
        collectQueriesData(queryClient, originalData, [
          ["files/matches", motherFile.id],
          ["files/matches", file.id],
        ]);

        const updater = (data) =>
          new PagedResultsBuilder(
            data,
            checkFilters,
            makeComparator
          ).updateEntity(match, () => match).results;

        // Perform optimistic updates
        queryClient.setQueriesData(["files/matches", motherFile.id], updater);
        queryClient.setQueriesData(["files/matches", file.id], updater);

        return { originalData };
      },
      onSuccess: async (data, match) => {
        const { file, motherFile } = match;
        await Promise.all([
          queryClient.invalidateQueries(["files/matches", motherFile.id]),
          queryClient.invalidateQueries(["files/matches", file.id]),
          queryClient.invalidateQueries(["file", motherFile.id]),
          queryClient.invalidateQueries(["file", file.id]),
        ]);
      },
      onError: (error, variables, context) => {
        console.error("Match update failed", error);

        // Cancel optimistic updates
        context.originalData.forEach((data, exactKey) => {
          queryClient.setQueryData(exactKey, data);
        });
      },
      retry,
    }
  );

  return {
    updateMatch: mutation.mutateAsync,
  };
}
