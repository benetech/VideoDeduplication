import { Errors } from "./handler-types";
import ValidationErrorMessages from "./ValidationErrorMessages";
import { IntlShape } from "react-intl";

/**
 * Single field validator.
 */
export type FieldValidator<FieldType> = (
  value: FieldType | undefined,
  intl: IntlShape
) => string | null;

/**
 * Object fields validator.
 */
export type Validator<Fields> = {
  [Field in keyof Fields]: FieldValidator<Fields[Field]>;
};

export type ValidatorFn<Fields> = (
  fields: Fields,
  intl: IntlShape
) => Errors<Fields>;

/**
 * Check if any validation errors are found.
 */
export function hasErrors<Fields>(errors: Errors<Fields>): boolean {
  for (const error of Object.values(errors)) {
    if (error) {
      return true;
    }
  }
  return false;
}

/**
 * Shorthand for `Object.entries(validator)` with asserted types.
 */
function entries<Fields>(
  validator: Validator<Fields>
): [keyof Fields, FieldValidator<unknown>][] {
  return Object.entries(validator) as [keyof Fields, FieldValidator<unknown>][];
}

/**
 * Validate fields using the field validator.
 */
export function validate<Fields>(
  fields: Fields,
  validator: Validator<Fields>,
  intl: IntlShape
): Errors<Fields> {
  const errors: Errors<Fields> = {};

  for (const [fieldName, validateField] of entries(validator)) {
    errors[fieldName] = validateField(fields[fieldName], intl);
  }

  return errors;
}

type StringOptions = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
};

export class Valid {
  static fields<Fields>(validator: Validator<Fields>): ValidatorFn<Fields> {
    return (fields: Fields, intl: IntlShape) =>
      validate(fields, validator, intl);
  }

  static string(
    attrName: string,
    options: StringOptions = {}
  ): FieldValidator<string> {
    const { required = true } = options;
    return (value: string | undefined, intl: IntlShape) => {
      if (required && (value == null || value.length === 0)) {
        return ValidationErrorMessages.isMissing(attrName, intl);
      }
      return null;
    };
  }
}
