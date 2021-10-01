import { InfiniteData, useMutation, useQueryClient } from "react-query";
import { useServer } from "../../../server-api/context";
import collectQueriesData from "../../common/collectQueriesData";
import PagedResultsBuilder from "../../common/PagedResultsBuilder";
import {
  QueryFileMatchesRequest,
  QueryFileMatchesResults,
} from "../../../server-api/ServerAPI";
import { FileMatch, Match, MatchQueryFilters } from "../../../model/Match";
import { ComparatorFn } from "../../../lib/helpers/comparators";
import { MutationContext } from "../../common/useEntityMutation";

/**
 * Check if the file match satisfies query filters.
 */
function checkFilters(
  request: QueryFileMatchesRequest,
  match: FileMatch
): boolean {
  const { filters } = request;
  if (filters?.remote != null && match.file.external !== filters.remote) {
    return false;
  }
  return (
    filters?.falsePositive == null ||
    match.falsePositive === filters.falsePositive
  );
}

/**
 * Create file-match comparator.
 */
function makeComparator(): ComparatorFn<FileMatch> {
  return (first, second) => first.distance - second.distance;
}

/**
 * Update file match callback.
 */
export type UpdateFileMatchFn = (match: FileMatch) => Promise<unknown>;

/**
 * Get a callback to update match.
 */
export default function useUpdateFileMatch(): UpdateFileMatchFn {
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation<
    Match,
    Error,
    FileMatch,
    MutationContext<QueryFileMatchesResults>
  >((updatedMatch) => server.matches.update(updatedMatch), {
    onMutate: async (match) => {
      const { file, motherFile } = match;

      // Make sure optimistic updates will not be overwritten by any outgoing refetches
      if (motherFile != null) {
        await queryClient.cancelQueries(["files/matches", motherFile.id]);
      }
      await queryClient.cancelQueries(["files/matches", file.id]);

      // Collect old data
      const originalData = new Map();
      if (motherFile != null) {
        collectQueriesData(queryClient, originalData, [
          ["files/matches", motherFile.id],
        ]);
      }
      collectQueriesData(queryClient, originalData, [
        ["files/matches", file.id],
      ]);

      const updater = (data?: InfiniteData<QueryFileMatchesResults>) =>
        new PagedResultsBuilder<
          FileMatch,
          MatchQueryFilters,
          QueryFileMatchesResults
        >(data, checkFilters, makeComparator).updateEntity(match, () => match)
          .results as InfiniteData<QueryFileMatchesResults>;

      // Perform optimistic updates
      if (motherFile != null) {
        queryClient.setQueriesData<InfiniteData<QueryFileMatchesResults>>(
          ["files/matches", motherFile.id],
          updater
        );
      }
      queryClient.setQueriesData<InfiniteData<QueryFileMatchesResults>>(
        ["files/matches", file.id],
        updater
      );

      return { originalData };
    },
    onSuccess: async (data, match) => {
      const { file, motherFile } = match;
      await Promise.all([
        queryClient.invalidateQueries(["files/matches", file.id]),
        queryClient.invalidateQueries(["file", file.id]),
      ]);
      if (motherFile != null) {
        await Promise.all([
          queryClient.invalidateQueries(["files/matches", motherFile.id]),
          queryClient.invalidateQueries(["file", motherFile.id]),
        ]);
      }
    },
    onError: (error, variables, context) => {
      console.error("Match update failed", error);

      // Cancel optimistic updates
      if (context != null) {
        context.originalData.forEach((data, exactKey) => {
          queryClient.setQueryData(exactKey, data);
        });
      }
    },
  });

  return mutation.mutateAsync;
}
