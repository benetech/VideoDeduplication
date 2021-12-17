import { useFieldValidators } from "./useFieldValidators";
import { FormDescriptor } from "./descriptor-types";
import { useCallback } from "react";
import { Errors } from "./handler-types";
import { hasErrors } from "./validation";

export default function useEagerValidator<Fields>(
  descriptor: FormDescriptor<Fields>
): (fields: Fields) => Errors<Fields> {
  const validators = useFieldValidators(descriptor);
  return useCallback(
    (fields) => {
      const errors: Errors<Fields> = {};
      for (const validator of validators) {
        const errors = validator(fields);
        if (hasErrors(errors)) {
          return errors;
        }
      }
      return errors;
    },
    [validators]
  );
}
