import ValidationErrorMessages from "./ValidationErrorMessages";
import { FieldDescriptor } from "./descriptor-types";

/**
 * String field descriptor options.
 */
type StringOptions = {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  order?: number;
};

/**
 * String field descriptor factory.
 */
export function reqString(
  intlNameId: string,
  options: StringOptions = {}
): FieldDescriptor<string> {
  const { minLength, maxLength, pattern, order = 0 } = options;
  return {
    name: intlNameId,
    required: true,
    order,
    update: (newValue, currentValue, currentError, name, intl) => {
      if (newValue.length === 0) {
        return {
          value: newValue,
          error: ValidationErrorMessages.isMissing(name, intl),
        };
      }
      if (minLength != null && newValue.length < minLength) {
        return {
          value: newValue,
          error: ValidationErrorMessages.tooShort(name, intl),
        };
      }
      if (maxLength != null && newValue.length > maxLength) {
        return {
          value: newValue,
          error: ValidationErrorMessages.tooLong(name, intl),
        };
      }
      if (pattern != null && !pattern.test(newValue)) {
        return {
          value: newValue,
          error: ValidationErrorMessages.invalidFormat(name, intl),
        };
      }
      return { value: newValue, error: null };
    },
  };
}

/**
 * Integer field descriptor options.
 */
type IntegerOptions = {
  min?: number;
  max?: number;
  order?: number;
};

/**
 * Integer field descriptor factory.
 */
export function reqInteger(
  intlNameId: string,
  options: IntegerOptions = {}
): FieldDescriptor<number> {
  const { min, max, order = 0 } = options;
  return {
    name: intlNameId,
    required: true,
    order,
    update: (newValue, currentValue, currentError, name, intl) => {
      const asNumber = Number(newValue);
      if (Number.isNaN(asNumber)) {
        return { value: currentValue, error: currentError };
      }
      if (min != null && asNumber < min) {
        return {
          value: asNumber,
          error: ValidationErrorMessages.numberIsTooSmall(name, min, intl),
        };
      }
      if (max != null && asNumber > max) {
        return {
          value: asNumber,
          error: ValidationErrorMessages.numberIsTooBig(name, max, intl),
        };
      }
      if (Math.floor(asNumber) !== asNumber) {
        return {
          value: asNumber,
          error: ValidationErrorMessages.notInteger(name, intl),
        };
      }
      return { value: asNumber, error: null };
    },
  };
}
