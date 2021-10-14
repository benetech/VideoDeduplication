import { ValidationErrorCode } from "../../server-api/ServerError";
import { IntlShape } from "react-intl";

/**
 * Convert error code to name validation error message.
 */
export default function nameErrorMessage(
  intl: IntlShape,
  error: ValidationErrorCode
): string {
  if (error === ValidationErrorCode.UniqueViolation) {
    return intl.formatMessage({ id: "validation.nameExists" });
  } else if (error === ValidationErrorCode.MissingRequired) {
    return intl.formatMessage({ id: "validation.nameMissing" });
  } else if (error === ValidationErrorCode.OutOfBounds) {
    return intl.formatMessage({ id: "validation.nameTooLong" });
  } else {
    return "";
  }
}
