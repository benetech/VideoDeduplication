export type ErrorDTO = {
  message: string;
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

export function isErrorDTO(data: any): data is ErrorDTO {
  return typeof (data as ErrorDTO)?.message === "string";
}

export function isValidationErrorDTO(data: any): data is ValidationErrorDTO {
  return (
    isErrorDTO(data) && typeof (data as ValidationErrorDTO)?.fields === "object"
  );
}
