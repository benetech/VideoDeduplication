export type ErrorDTO = {
  error: string;
};

export enum ConstraintViolationCode {
  UniqueViolation = "UNIQUE_VIOLATION",
  MissingRequired = "MISSING_REQUIRED",
  InvalidValue = "INVALID_VALUE",
  OutOfBounds = "OUT_OF_BOUNDS",
}

export type FieldConstraintViolations = {
  [field: string]: ConstraintViolationCode;
};
export type ValidationErrorDTO = ErrorDTO & {
  fields: FieldConstraintViolations;
};

export function isErrorDTO(data: unknown): data is ErrorDTO {
  return typeof (data as ErrorDTO)?.error === "string";
}

export function isValidationErrorDTO(
  data: unknown
): data is ValidationErrorDTO {
  return (
    isErrorDTO(data) && typeof (data as ValidationErrorDTO)?.fields === "object"
  );
}
