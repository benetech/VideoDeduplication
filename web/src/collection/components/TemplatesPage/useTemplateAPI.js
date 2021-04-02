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

  const handleDeleteExample = useCallback((example) => {
    dispatch(deleteExample(example.id));
    server
      .deleteExample({ id: example.id })
      .then((response) => {
        if (response.failure) {
          console.error("Unsuccessful example delete", response);
          dispatch(addExample(example));
        }
      })
      .catch((error) => {
        console.error("Catch delete-example error", error);
        dispatch(addExample(example));
      });
  });

  const handleUploadExample = useCallback((files, template) => {
    for (const file of files) {
      server
        .uploadExample({ file, templateId: template.id })
        .then((response) => {
          if (response.success) {
            dispatch(addExample(response.data));
          } else {
            console.error(`Example uploading failed: ${file.name}`, response);
          }
        })
        .catch((error) =>
          console.error(
            `Error occurred while uploading a new example: ${file.name}`,
            error
          )
        );
    }
  });

  const handleUpdateTemplate = useCallback((updated, original) => {
    dispatch(updateTemplate(updated));
    server
      .updateTemplate({ template: updated })
      .then((response) => {
        if (response.failure) {
          console.error("Unsuccessful template update", response);
          dispatch(updateTemplate(original));
        }
      })
      .catch((error) => {
        console.error("Catch template update error", error);
        dispatch(updateTemplate(original));
      });
  });

  const handleDeleteTemplate = useCallback((template) => {
    dispatch(deleteTemplate(template.id));
    server
      .deleteTemplate({ id: template.id })
      .then((response) => {
        if (response.failure) {
          console.error("Template deletion failed", response);
          dispatch(addTemplates([template]));
        }
      })
      .catch((error) => {
        console.error("Error occurred while deleting template", error);
        dispatch(addTemplates([template]));
      });
  });

  const handleCreateTemplate = useCallback(async ({ name, icon }) => {
    try {
      const response = await server.createTemplate({
        template: { name, icon },
      });
      if (response.success) {
        dispatch(addTemplates([response.data]));
      } else {
        console.error("Creating template failed", response);
      }
      return response;
    } catch (error) {
      console.error("Error creating template", error);
      throw error;
    }
  });

  return {
    uploadExample: handleUploadExample,
    deleteExample: handleDeleteExample,
    createTemplate: handleCreateTemplate,
    deleteTemplate: handleDeleteTemplate,
    updateTemplate: handleUpdateTemplate,
  };
}