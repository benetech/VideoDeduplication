import { useMemo } from "react";
import { useIntl } from "react-intl";
import { Errors, FormHandler } from "./handler-types";
import { descrEntries, FormDescriptor } from "./descriptor-types";

/**
 * Create form handler.
 */
export default function useFields<Fields>(
  descriptor: FormDescriptor<Fields>,
  fields: Fields,
  errors: Errors<Fields>,
  onFieldsChange: (fields: Fields) => void,
  onErrorsChange: (errors: Errors<Fields>) => void
): FormHandler<Fields> {
  const intl = useIntl();
  return useMemo<FormHandler<Fields>>(() => {
    const result: Partial<FormHandler<Fields>> = {};

    // For each form field
    for (const [fieldName, fieldDescriptor] of descrEntries(descriptor)) {
      // Human-readable name
      const name = intl.formatMessage({ id: fieldDescriptor.name });

      // Create the corresponding field handler
      result[fieldName] = {
        name,
        required: fieldDescriptor.required,
        onChange: (event) => {
          const { error, value } = fieldDescriptor.update(
            event.target.value,
            fields[fieldName],
            errors[fieldName],
            name,
            intl
          );
          if (error !== errors[fieldName]) {
            onErrorsChange({ ...errors, [fieldName]: error });
          }
          if (value !== fields[fieldName]) {
            onFieldsChange({ ...fields, [fieldName]: value });
          }
        },
      };
    }

    return result as FormHandler<Fields>;
  }, [fields, errors, onFieldsChange, onErrorsChange, descriptor]);
}
