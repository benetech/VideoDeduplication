/**
 * Convert error code to name validation error message.
 */
export default function nameErrorMessage(intl, error) {
  if (error === "UNIQUE_VIOLATION") {
    return intl.formatMessage({ id: "validation.nameExists" });
  } else if (error === "MISSING_REQUIRED") {
    return intl.formatMessage({ id: "validation.nameMissing" });
  } else {
    return "";
  }
}
