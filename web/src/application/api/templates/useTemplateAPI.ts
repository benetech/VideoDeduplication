import { useCallback } from "react";
import { useServer } from "../../../server-api/context";
import handleError from "../../../lib/helpers/handleError";
import {
  ComparatorFn,
  stringComparator,
} from "../../../lib/helpers/comparators";
import {
  useCreateEntity,
  useDeleteEntity,
  useUpdateEntity,
} from "../../common/useEntityMutation";
import { useMutation, useQueryClient } from "react-query";
import {
  Template,
  TemplateExample,
  TemplateFilters,
} from "../../../model/Template";
import { FrameDescriptor } from "../../../model/VideoFile";
import { ListRequest } from "../../../server-api/ServerAPI";
import { CreateFn, DeleteFn, UpdateFn } from "../../common/model";

/**
 * Upload multiple examples callback.
 */
export type UploadExamplesFn = (
  files: File[],
  template: Template
) => Promise<void>;

/**
 * Mutation function argument type for examples uploading.
 */
type UploadExampleRequest = {
  template: Template;
  file: File;
};

/**
 * Get a callback to upload images as template-examples.
 */
export function useUploadExamples(raise = false): UploadExamplesFn {
  const server = useServer();
  const queryClient = useQueryClient();
  const { mutateAsync: uploadSingleExample } = useMutation<
    TemplateExample,
    Error,
    UploadExampleRequest
  >(({ template, file }) => server.examples.upload(template, file), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("templates");
    },
  });
  return useCallback(async (files: File[], template: Template) => {
    for (const file of files) {
      try {
        await uploadSingleExample({ template, file });
      } catch (error) {
        handleError(raise, error);
      }
    }
  }, []);
}

/**
 * Create example from frame request.
 */
export type CreateExampleRequest = FrameDescriptor & {
  template: Template;
};

/**
 * Callback to create example from frame.
 */
export type CreateExampleFn = (
  request: CreateExampleRequest
) => Promise<TemplateExample>;

/**
 * Get a callback to create template-examples from file frames.
 */
export function useCreateExampleFromFrame(): CreateExampleFn {
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation<TemplateExample, Error, CreateExampleRequest>(
    ({ template, file, time }) =>
      server.examples.createFromFrame({
        template,
        file,
        time,
      }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries("templates");
      },
    }
  );

  return mutation.mutateAsync;
}

/**
 * Get a callback to delete template-example.
 */
export function useDeleteExample(): DeleteFn<TemplateExample> {
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation<
    void,
    Error,
    TemplateExample | TemplateExample["id"]
  >((example) => server.examples.delete(example), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("templates");
    },
  });

  return mutation.mutateAsync;
}

/**
 * Check if the template satisfies query params.
 */
function checkFilters(
  request: ListRequest<TemplateFilters>,
  template: Template
): boolean {
  const { filters } = request;
  return filters?.name == null || template.name.includes(filters.name);
}

/**
 * Create template sort comparator from query params.
 */
function makeComparator(): ComparatorFn<Template> {
  return (first, second) => stringComparator(first.name, second.name);
}

/**
 * Get a callback to update template.
 */
export function useUpdateTemplate(): UpdateFn<Template> {
  const server = useServer();
  const mutation = useUpdateEntity<Template, TemplateFilters>({
    updateFn: (template) => server.templates.update(template),
    checkFilters,
    makeComparator,
    updateKeys: ["templates"],
  });

  return mutation.mutateAsync;
}

/**
 * Get a callback to create template.
 */
export function useCreateTemplate(): CreateFn<Template> {
  const server = useServer();
  const mutation = useCreateEntity<Template, TemplateFilters>({
    createFn: (template) => server.templates.create(template),
    checkFilters,
    makeComparator,
    updateKeys: ["templates"],
  });

  return mutation.mutateAsync;
}

/**
 * Get a callback to delete Template.
 */
export function useDeleteTemplate(): DeleteFn<Template> {
  const server = useServer();
  const mutation = useDeleteEntity<Template, TemplateFilters>({
    deleteFn: (template) => server.templates.delete(template),
    checkFilters,
    makeComparator,
    updateKeys: ["templates"],
  });

  return mutation.mutateAsync;
}

export type UseTemplatesAPI = {
  uploadExamples: UploadExamplesFn;
  deleteExample: DeleteFn<TemplateExample>;
  createExampleFromFrame: CreateExampleFn;
  createTemplate: CreateFn<Template>;
  updateTemplate: UpdateFn<Template>;
  deleteTemplate: DeleteFn<Template>;
};

/**
 * Get templates API.
 */
export default function useTemplateAPI(): UseTemplatesAPI {
  const uploadExamples = useUploadExamples();
  const deleteExample = useDeleteExample();
  const createExampleFromFrame = useCreateExampleFromFrame();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  return {
    uploadExamples,
    deleteExample,
    createExampleFromFrame,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
