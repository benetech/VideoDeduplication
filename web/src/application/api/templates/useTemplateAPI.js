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
import handleError from "../../../lib/helpers/handleError";

/**
 * Get a callback to upload images as template-examples.
 * @param {boolean} raise if false, will not throw errors
 * @return {(function(File[], TemplateEntity): Promise<void>)}
 */
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

/**
 * Get a callback to create template-examples from file frames.
 * @param {boolean} raise if false, callback will not throw errors
 * @return {(function(TemplateEntity|string|number, FileEntity|string|number, number): Promise<TemplateExampleEntity>)}
 */
export function useCreateExampleFromFrame(raise = false) {
  const dispatch = useDispatch();
  const server = useServer();
  return useCallback(async (template, file, time) => {
    try {
      const example = await server.examples.createFromFrame({
        template,
        file,
        time,
      });
      dispatch(addExample(example));
    } catch (error) {
      handleError(raise, error);
    }
  });
}

/**
 * Get a callback to delete template-example.
 * @param {boolean} raise if false, will not throw errors
 * @return {(function(TemplateExampleEntity): Promise<void>)|*}
 */
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

/**
 * Get a callback to update template.
 * @param {boolean} raise if false, will not throw errors
 * @return {(function(*=, *=): Promise<*|undefined>)|*}
 */
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

/**
 * Get a callback to delete template.
 * @param raise if false, will not throw errors
 * @return {(function(TemplateEntity): Promise<void>)}
 */
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

/**
 * Get a callback to create a new template.
 * @param raise if false, will not throw errors
 * @return {(function({name: *, icon: *}): Promise<TemplateEntity>)}
 */
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

/**
 * Get callbacks for template CRUD operations.
 * @param raise if false, will not throw errors
 */
export default function useTemplateAPI(raise = true) {
  return {
    createTemplate: useAddTemplate(raise),
    deleteTemplate: useDeleteTemplate(raise),
    updateTemplate: useUpdateTemplate(raise),
    uploadExample: useUploadExamples(raise),
    deleteExample: useDeleteExample(raise),
    createExampleFromFrame: useCreateExampleFromFrame(raise),
  };
}
