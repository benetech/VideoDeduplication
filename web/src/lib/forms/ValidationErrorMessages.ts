import { IntlShape } from "react-intl";

/**
 * Collection of factory methods for validation error messages.
 */
export default class ValidationErrorMessages {
  /**
   * Required field value is missing.
   */
  static isMissing(attrName: string, intl: IntlShape): string {
    return intl.formatMessage({ id: "validation.missing" }, { attrName });
  }

  /**
   * Field must be unique.
   */
  static notUnique(attrName: string, intl: IntlShape): string {
    return intl.formatMessage({ id: "validation.notUnique" }, { attrName });
  }

  /**
   * String or list is too short.
   */
  static tooShort(attrName: string, intl: IntlShape): string {
    return intl.formatMessage({ id: "validation.tooShort" }, { attrName });
  }

  /**
   * String or list is too long.
   */
  static tooLong(attrName: string, intl: IntlShape): string {
    return intl.formatMessage({ id: "validation.tooLong" }, { attrName });
  }

  /**
   * Attribute value is invalid.
   */
  static isInvalid(attrName: string, intl: IntlShape): string {
    return intl.formatMessage({ id: "validation.invalid" }, { attrName });
  }

  /**
   * String attribute has invalid format.
   */
  static invalidFormat(attrName: string, intl: IntlShape): string {
    return intl.formatMessage({ id: "validation.invalidFormat" }, { attrName });
  }

  /**
   * Number is too big.
   */
  static numberIsTooBig(
    attrName: string,
    maxValue: number,
    intl: IntlShape
  ): string {
    return intl.formatMessage(
      { id: "validation.numberIsTooBig" },
      { attrName, maxValue }
    );
  }

  /**
   * Number is too small.
   */
  static numberIsTooSmall(
    attrName: string,
    minValue: number,
    intl: IntlShape
  ): string {
    return intl.formatMessage(
      { id: "validation.numberIsTooSmall" },
      { attrName, minValue }
    );
  }

  /**
   * Number is not an integer.
   */
  static notInteger(attrName: string, intl: IntlShape): string {
    return intl.formatMessage({ id: "validation.notInteger" }, { attrName });
  }
}
