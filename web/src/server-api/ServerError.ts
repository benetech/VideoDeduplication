import lodash from "lodash";
import axios from "axios";
import StatusCodes from "http-status-codes";
import { Json } from "../lib/types/Json";
import {
  ConstraintViolationCode,
  FieldConstraintViolations,
  isValidationErrorDTO,
  ValidationErrorDTO,
} from "./v1/dto/error";

export enum ErrorCode {
  /**
   * Entity not found.
   */
  NotFound,

  /**
   * Invalid request.
   */
  InvalidRequest,

  /**
   * Internal server error
   */
  ServerError,

  /**
   * Authentication required or not enough permissions
   */
  Unauthorized,

  /**
   * Control flow error on client side
   */
  ClientError,

  /**
   * Network error, service is not available
   */
  Unavailable,
}

export class ServerError<Data = Json> extends Error {
  public readonly cause: Error | null;
  public readonly code: ErrorCode;
  public readonly data?: Data;
  public readonly request: unknown;

  public static readonly Code = ErrorCode;

  constructor(message: string, cause: Error | null, request: unknown) {
    super(ServerError.errorMessage(cause, message));
    this.cause = cause;
    this.code = ServerError.errorCode(cause);
    this.request = request;
    if (axios.isAxiosError(cause)) {
      this.data = cause.response?.data;
    }
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  private static errorCode(error: Error | null): ErrorCode {
    if (axios.isAxiosError(error)) {
      const response = error.response;
      switch (response?.status) {
        case StatusCodes.BAD_REQUEST:
          return ErrorCode.InvalidRequest;
        case StatusCodes.UNAUTHORIZED:
          return ErrorCode.Unauthorized;
        case StatusCodes.NOT_FOUND:
          return ErrorCode.NotFound;
        default:
          return ErrorCode.ClientError;
      }
    }
    return ErrorCode.ClientError;
  }

  /**
   * Compose error message.
   */
  private static errorMessage(error: Error | null, message?: string): string {
    if (error?.message == null) {
      return message || "Unknown error";
    }
    return `${message} Cause: ${error.message}`;
  }
}

export enum ValidationErrorCode {
  UniqueViolation = "UNIQUE_VIOLATION",
  MissingRequired = "MISSING_REQUIRED",
  InvalidValue = "INVALID_VALUE",
  OutOfBounds = "OUT_OF_BOUNDS",
}

export type FieldErrors = {
  [field: string]: ValidationErrorCode;
};

export class ValidationError extends ServerError<ValidationErrorDTO> {
  public readonly fields: FieldErrors;

  constructor(
    message: string,
    cause: Error,
    request: unknown,
    fields?: FieldErrors
  ) {
    super(message, cause, request);
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.fields = this.resolveFields(fields);
  }

  private resolveFields(fields?: FieldErrors): FieldErrors {
    if (fields != null) {
      return fields;
    } else if (typeof this.data?.fields === "object") {
      return ValidationError.transformFields(this.data.fields);
    } else {
      return {};
    }
  }

  /**
   * Transform API error codes to the values used in the frontend.
   * This is done to ensure decoupling of frontend from the protocol.
   * See server.api.constants.ValidationErrors on Backend.
   */
  private static transformFields(
    fields: FieldConstraintViolations
  ): FieldErrors {
    return lodash.transform(fields, (result, value, key) => {
      if (value === ConstraintViolationCode.UniqueViolation) {
        result[key] = ValidationErrorCode.UniqueViolation;
      } else if (value === ConstraintViolationCode.MissingRequired) {
        result[key] = ValidationErrorCode.MissingRequired;
      } else if (value === ConstraintViolationCode.OutOfBounds) {
        result[key] = ValidationErrorCode.OutOfBounds;
      } else {
        result[key] = ValidationErrorCode.InvalidValue;
      }
    });
  }
}

/**
 * Create a ServerError representing unsuccessful API call.
 */
export function makeServerError(
  message: string,
  cause: Error | unknown,
  request?: unknown
): ServerError {
  if (axios.isAxiosError(cause) && isValidationErrorDTO(cause.response?.data)) {
    return new ValidationError(message, cause, request);
  } else if (cause instanceof Error) {
    return new ServerError(message, cause, request);
  } else {
    return new ServerError(message, null, request);
  }
}
