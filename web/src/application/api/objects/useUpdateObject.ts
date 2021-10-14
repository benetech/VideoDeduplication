import { useServer } from "../../../server-api/context";
import { TemplateMatch, TemplateMatchFilters } from "../../../model/Template";
import { ListRequest, ListResults } from "../../../server-api/ServerAPI";
import { ComparatorFn } from "../../../lib/helpers/comparators";
import { UpdateFn } from "../../common/model";
import { useUpdateEntity } from "../../common/useEntityMutation";

/**
 * Check if the object satisfies query params.
 */
function checkFilters(
  request: ListRequest<TemplateMatchFilters>,
  object: TemplateMatch
): boolean {
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
 */
function startTimeComparator(
  objectA: TemplateMatch,
  objectB: TemplateMatch
): number {
  return objectA.start - objectB.start;
}

/**
 * Create objects sort comparator from query params.
 */
function makeComparator(): ComparatorFn<TemplateMatch> {
  return startTimeComparator;
}

/**
 * Get a callback to update match.
 */
export default function useUpdateObject(): UpdateFn<
  TemplateMatch,
  TemplateMatch
> {
  const server = useServer();
  const mutation = useUpdateEntity<
    TemplateMatch,
    TemplateMatchFilters,
    ListResults<TemplateMatch, TemplateMatchFilters>,
    TemplateMatch
  >({
    updateFn: (object) => server.templateMatches.update(object),
    checkFilters,
    makeComparator,
    updateKeys: (object) => [["template_matches", { fileId: object.fileId }]],
  });

  return mutation.mutateAsync;
}
