import { FormDescriptor } from "./descriptor-types";
import { useCallback } from "react";
import { hasErrors } from "./validation";
import { useFieldValidators } from "./useFieldValidators";
import { Errors } from "./handler-types";

export default function useLazyValidator<Fields>(
  descriptor: FormDescriptor<Fields>
): (fields: Fields) => Errors<Fields> {
  const validators = useFieldValidators(descriptor);
  return useCallback(
    (fields) => {
      for (const validator of validators) {
        const errors = validator(fields);
        if (hasErrors(errors)) {
          return errors;
        }
      }
      return {};
    },
    [validators]
  );
}
