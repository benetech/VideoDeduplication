import { useIntl } from "react-intl";
import nameErrorMessage from "../../../lib/messages/nameErrorMessage";
import { useCallback, useState } from "react";
import IconKind from "../../../prop-types/IconKind";
import { useCreateTemplate } from "../../../application/api/templates/useTemplateAPI";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    defaultName: intl.formatMessage({ id: "templates.name" }),
    nameError: (error) => nameErrorMessage(intl, error),
  };
}

const defaultIcon = {
  kind: IconKind.PREDEFINED,
  key: "GiPoliceOfficerHead",
};

export default function useNewTemplateForm() {
  const messages = useMessages();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "" });
  const [template, setTemplate] = useState({
    icon: defaultIcon,
    name: messages.defaultName,
    examples: [],
  });

  const onChange = useCallback(
    (updated) => {
      if (updated.name !== template.name) {
        setErrors({ ...errors, name: "" });
      }
      setTemplate(updated);
    },
    [template, errors]
  );

  const { createTemplate } = useCreateTemplate();
  const onCreate = useCallback(async () => {
    setIsLoading(true);
    try {
      return await createTemplate(template);
    } catch (error) {
      setErrors({
        ...error,
        name: messages.nameError(error.data?.fields?.name),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [template, errors]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setErrors({ name: "" });
    setTemplate({
      icon: defaultIcon,
      name: messages.defaultName,
    });
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
