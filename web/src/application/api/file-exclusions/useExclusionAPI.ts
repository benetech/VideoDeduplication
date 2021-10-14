import { useServer } from "../../../server-api/context";
import {
  ComparatorFn,
  stringComparator,
} from "../../../lib/helpers/comparators";
import { ListRequest } from "../../../server-api/ServerAPI";
import {
  TemplateExclusion,
  TemplateExclusionFilters,
} from "../../../model/Template";
import { AsyncOperation, CreateFn } from "../../common/model";
import {
  useCreateEntity,
  useDeleteFullEntity,
} from "../../common/useEntityMutation";

/**
 * Check if the exclusion satisfies query filters.
 */
function checkFilters(
  request: ListRequest<TemplateExclusionFilters>,
  exclusion: TemplateExclusion
): boolean {
  const { filters } = request;
  if (
    filters?.templateId != null &&
    exclusion.template.id !== filters.templateId
  ) {
    return false;
  }
  return filters?.fileId == null || exclusion.file.id === filters.fileId;
}

/**
 * Create template exclusion sort comparator.
 */
function makeComparator(): ComparatorFn<TemplateExclusion> {
  return (first, second) =>
    stringComparator(first.template.name, second.template.name);
}

/**
 * Get a callback to create exclusion.
 */
export function useCreateExclusion(): CreateFn<TemplateExclusion> {
  const server = useServer();
  const mutation = useCreateEntity<TemplateExclusion, TemplateExclusionFilters>(
    {
      createFn: (newExclusion) =>
        server.templateExclusions.create(newExclusion),
      checkFilters,
      makeComparator,
      updateKeys: (exclusion) => [
        ["template-file-exclusions", { fileId: exclusion.file.id }],
      ],
      invalidateKeys: (exclusion) => [
        ["template-file-exclusions", { fileId: exclusion.file.id }],
        ["template_matches", { fileId: exclusion.file.id }],
      ],
    }
  );

  return mutation.mutateAsync;
}

/**
 * Get a callback to delete exclusion.
 */
export function useDeleteExclusion(): AsyncOperation<TemplateExclusion> {
  const server = useServer();

  const mutation = useDeleteFullEntity<
    TemplateExclusion,
    TemplateExclusionFilters
  >({
    deleteFn: (exclusion) => server.templateExclusions.delete(exclusion),
    checkFilters,
    makeComparator,
    updateKeys: (exclusion) => [
      ["template-file-exclusions", { fileId: exclusion.file.id }],
    ],
  });
  return mutation.mutateAsync;
}

/**
 * Exclusion API callbacks.
 */
export type UseExclusionAPI = {
  createExclusion: CreateFn<TemplateExclusion>;
  deleteExclusion: AsyncOperation<TemplateExclusion>;
};

/**
 * Get exclusions API.
 */
export default function useExclusionAPI(): UseExclusionAPI {
  const createExclusion = useCreateExclusion();
  const deleteExclusion = useDeleteExclusion();
  return { createExclusion, deleteExclusion };
}
