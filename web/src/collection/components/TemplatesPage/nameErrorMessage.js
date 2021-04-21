import { ValidationError } from "../../../server-api/Server/ServerError";

/**
 * Convert error code to name validation error message.
 */
export default function nameErrorMessage(intl, error) {
  if (error === ValidationError.UNIQUE_VIOLATION) {
    return intl.formatMessage({ id: "validation.nameExists" });
  } else if (error === ValidationError.MISSING_REQUIRED) {
    return intl.formatMessage({ id: "validation.nameMissing" });
  } else if (error === ValidationError.OUT_OF_BOUNDS) {
    return intl.formatMessage({ id: "validation.nameTooLong" });
  } else {
    return "";
  }
}
