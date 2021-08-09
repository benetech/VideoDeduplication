import { useServer } from "../../../server-api/context";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  addExample,
  addTemplates,
  deleteExample,
  deleteTemplate,
  updateTemplate,
} from "../../state/templates/actions";

/**
 * Get template actions handler.
 */
export default function useTemplateAPI() {
  const server = useServer();
  const dispatch = useDispatch();

  const handleDeleteExample = useCallback(async (example) => {
    dispatch(deleteExample(example.id));
    try {
      await server.examples.delete(example.id);
    } catch (error) {
      dispatch(addExample(example));
      throw error;
    }
  });

  const handleUploadExample = useCallback(async (files, template) => {
    for (const file of files) {
      try {
        const example = await server.examples.upload(template.id, file);
        dispatch(addExample(example));
      } catch (error) {
        console.error(error);
      }
    }
  });

  const handleUpdateTemplate = useCallback(async (updates, original) => {
    dispatch(updateTemplate(updates));
    try {
      return await server.templates.update(updates);
    } catch (error) {
      dispatch(updateTemplate(original));
      throw error;
    }
  });

  const handleDeleteTemplate = useCallback(async (template) => {
    dispatch(deleteTemplate(template.id));
    try {
      await server.templates.delete(template);
    } catch (error) {
      dispatch(addTemplates([template]));
      throw error;
    }
  });

  const handleCreateTemplate = useCallback(async ({ name, icon }) => {
    const template = await server.templates.create({ name, icon });
    dispatch(addTemplates([template]));
    return template;
  });

  return {
    uploadExample: handleUploadExample,
    deleteExample: handleDeleteExample,
    createTemplate: handleCreateTemplate,
    deleteTemplate: handleDeleteTemplate,
    updateTemplate: handleUpdateTemplate,
  };
}
