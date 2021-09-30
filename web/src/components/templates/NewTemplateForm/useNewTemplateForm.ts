import { useIntl } from "react-intl";
import nameErrorMessage from "../../../lib/messages/nameErrorMessage";
import { useCallback, useState } from "react";
import { useCreateTemplate } from "../../../application/api/templates/useTemplateAPI";
import { makeTemplate, Template } from "../../../model/Template";
import { Transient } from "../../../lib/entity/Entity";
import {
  ValidationError,
  ValidationErrorCode,
} from "../../../server-api/ServerError";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    defaultName: intl.formatMessage({ id: "templates.name" }),
    nameError: (error: ValidationErrorCode) => nameErrorMessage(intl, error),
  };
}

/**
 * Template error messages.
 */
export type TemplateErrors = {
  name: string;
};

/**
 * `useNewTemplateForm` hook results.
 */
type UseNewTemplateFormResults = {
  template: Transient<Template>;
  errors: TemplateErrors;
  isLoading: boolean;
  onChange: (template: Transient<Template>) => void;
  onCreate: () => Promise<Template>;
  reset: () => void;
};

export default function useNewTemplateForm(): UseNewTemplateFormResults {
  const messages = useMessages();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<TemplateErrors>({ name: "" });
  const [template, setTemplate] = useState<Transient<Template>>(makeTemplate());

  const onChange = useCallback(
    (updated: Transient<Template>) => {
      if (updated.name !== template.name) {
        setErrors({ ...errors, name: "" });
      }
      setTemplate(updated);
    },
    [template, errors]
  );

  const createTemplate = useCreateTemplate();
  const onCreate = useCallback(async () => {
    setIsLoading(true);
    try {
      return await createTemplate(template);
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors({
          ...errors,
          name: messages.nameError(error.fields?.name),
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [template, errors]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setErrors({ name: "" });
    setTemplate(makeTemplate());
  }, []);

  return {
    template,
    errors,
    isLoading,
    onChange,
    onCreate,
    reset,
  };
}
