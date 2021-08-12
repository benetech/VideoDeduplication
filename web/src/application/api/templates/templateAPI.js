import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useServer } from "../../../server-api/context";
import {
  addExample,
  addTemplate,
  deleteExample,
  deleteTemplate,
  updateTemplate,
} from "../../state/templates/common/actions";

/**
 * Handle error helper.
 * @param {boolean} raise indicates whether the error should be thrown.
 * @param {Error} error caught error
 */
function handleError(raise, error) {
  if (raise) {
    throw error;
  }
  console.log(error);
}

export function useUploadExamples(raise = false) {
  const dispatch = useDispatch();
  const server = useServer();
  return useCallback(async (files, template) => {
    for (const file of files) {
      try {
        const example = await server.examples.upload(template.id, file);
        dispatch(addExample(example));
      } catch (error) {
        handleError(raise, error);
      }
    }
  });
}

export function useDeleteExample(raise = true) {
  const dispatch = useDispatch();
  const server = useServer();
  return useCallback(async (example) => {
    dispatch(deleteExample(example));
    try {
      await server.examples.delete(example);
    } catch (error) {
      dispatch(addExample(example));
      handleError(raise, error);
    }
  });
}

export function useUpdateTemplate(raise = true) {
  const dispatch = useDispatch();
  const server = useServer();
  return useCallback(async (updates, original) => {
    dispatch(updateTemplate(updates));
    try {
      return await server.templates.update(updates);
    } catch (error) {
      dispatch(updateTemplate(original));
      handleError(raise, error);
    }
  });
}

export function useDeleteTemplate(raise = true) {
  const dispatch = useDispatch();
  const server = useServer();
  return useCallback(async (template) => {
    dispatch(deleteTemplate(template));
    try {
      await server.templates.delete(template);
    } catch (error) {
      dispatch(addTemplate(template));
      handleError(raise, error);
    }
  });
}

export function useAddTemplate(raise = true) {
  const dispatch = useDispatch();
  const server = useServer();
  return useCallback(async ({ name, icon }) => {
    try {
      const template = await server.templates.create({ name, icon });
      dispatch(addTemplate(template));
      return template;
    } catch (error) {
      handleError(raise, error);
    }
  });
}

export default function useTemplateAPI(raise = true) {
  return {
    createTemplate: useAddTemplate(raise),
    deleteTemplate: useDeleteTemplate(raise),
    updateTemplate: useUpdateTemplate(raise),
    uploadExample: useUploadExamples(raise),
    deleteExample: useDeleteExample(raise),
  };
}
