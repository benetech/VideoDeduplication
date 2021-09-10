import { useCallback } from "react";
import { useServer } from "../../../server-api/context";
import handleError from "../../../lib/helpers/handleError";
import { stringComparator } from "../../../lib/helpers/comparators";
import {
  useCreateEntity,
  useDeleteEntity,
  useUpdateEntity,
} from "../../common/react-query/useEntityMutation";
import { useMutation, useQueryClient } from "react-query";

/**
 * Get a callback to upload images as template-examples.
 * @return {{uploadExamples: (function():Promise)}}
 */
export function useUploadExamples(raise = false) {
  const server = useServer();
  const queryClient = useQueryClient();
  const { mutateAsync: uploadSingleExample } = useMutation(
    ({ template, file }) => server.examples.upload(template.id, file),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries("templates");
      },
    }
  );
  const uploadExamples = useCallback(async (files, template) => {
    for (const file of files) {
      try {
        await uploadSingleExample({ template, file });
      } catch (error) {
        handleError(raise, error);
      }
    }
  });

  return {
    uploadExamples,
  };
}

/**
 * Get a callback to create template-examples from file frames.
 * @return {{createExampleFromFrame:function}}
 */
export function useCreateExampleFromFrame() {
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation(
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

  return {
    createExampleFromFrame: mutation.mutateAsync,
  };
}

/**
 * Get a callback to delete template-example.
 * @return {{deleteExample: (function(TemplateExampleEntity): Promise<void>)|*}}
 */
export function useDeleteExample() {
  const server = useServer();
  const queryClient = useQueryClient();
  const mutation = useMutation((example) => server.examples.delete(example), {
    onSuccess: async () => {
      await queryClient.invalidateQueries("templates");
    },
  });

  return {
    deleteExample: mutation.mutateAsync,
  };
}

/**
 * Check if the template satisfies query params.
 * @param {{
 *   filters: TemplateFilters
 * }} request
 * @param {TemplateEntity} template
 * @return {boolean}
 */
function checkFilters(request, template) {
  const { filters } = request;
  return filters?.name == null || template.name.includes(filters.name);
}

/**
 * Create template sort comparator from query params.
 * @return {(function(TemplateEntity,TemplateEntity): number)}
 */
function makeComparator() {
  return (first, second) => stringComparator(first.name, second.name);
}

/**
 * Get a callback to update template.
 * @return {{
 *   updateTemplate: function
 * }}
 */
export function useUpdateTemplate() {
  const server = useServer();
  const mutation = useUpdateEntity({
    mutationFn: (template) => server.templates.update(template),
    checkFilters,
    makeComparator,
    updateKeys: ["templates"],
  });

  return {
    updateTemplate: mutation.mutateAsync,
  };
}

/**
 * Get a callback to create template.
 * @return {{
 *   createTemplate: function
 * }}
 */
export function useCreateTemplate() {
  const server = useServer();
  const mutation = useCreateEntity({
    mutationFn: (template) => {
      console.log("Template", template);
      return server.templates.create(template);
    },
    checkFilters,
    makeComparator,
    updateKeys: ["templates"],
    optimistic: false,
  });

  return {
    createTemplate: mutation.mutateAsync,
  };
}

/**
 * Get a callback to delete Template.
 * @return {{
 *   deleteTemplate: function
 * }}
 */
export function useDeleteTemplate() {
  const server = useServer();
  const mutation = useDeleteEntity({
    mutationFn: (template) => server.templates.delete(template),
    checkFilters,
    makeComparator,
    updateKeys: ["templates"],
  });

  return {
    deleteTemplate: mutation.mutateAsync,
  };
}

/**
 * Get templates API.
 * @param {MutationOptions} options
 * @return {{
 *   uploadExamples: function,
 *   deleteExample: function,
 *   createExampleFromFrame: function,
 *   createTemplate: function,
 *   updateTemplate: function,
 *   deleteTemplate: function
 * }}
 */
export default function useTemplateAPI(options) {
  const { uploadExamples } = useUploadExamples();
  const { deleteExample } = useDeleteExample();
  const { createExampleFromFrame } = useCreateExampleFromFrame();
  const { createTemplate } = useCreateTemplate(options);
  const { updateTemplate } = useUpdateTemplate(options);
  const { deleteTemplate } = useDeleteTemplate(options);
  return {
    uploadExamples,
    deleteExample,
    createExampleFromFrame,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
