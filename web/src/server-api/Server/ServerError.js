import * as HttpStatus from "http-status-codes";
import lodash from "lodash";

/**
 * Determine error status.
 */
function errorCode(error) {
  if (error?.response == null) {
    return Status.CLIENT_ERROR;
  }
  const response = error.response;
  switch (response.status) {
    case HttpStatus.BAD_REQUEST:
      return Status.INVALID_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return Status.UNAUTHORIZED;
    case HttpStatus.NOT_FOUND:
      return Status.NOT_FOUND;
    default:
      return Status.CLIENT_ERROR;
  }
}

/**
 * Compose error message.
 */
function errorMessage(error, message) {
  if (error?.message == null) {
    return message;
  }
  return `${message} Cause: ${error.message}`;
}

/**
 * Application Backend API Error.
 */
export default class ServerError extends Error {
  /**
   * Enum for application-specific error codes.
   */
  static NOT_FOUND = 2;

  /**
   * Invalid request
   */
  static INVALID_REQUEST = 3;

  /**
   * Internal server error
   */
  static SERVER_ERROR = 4;

  /**
   * Authentication required or not enough permissions
   */
  static UNAUTHORIZED = 5;

  /**
   * Control flow error on client side
   */
  static CLIENT_ERROR = 7;

  /**
   * Network error, service is not available
   */
  static UNAVAILABLE = 8;

  constructor(message, cause, request) {
    super(errorMessage(cause, message));
    this.cause = cause;
    this.code = errorCode(cause);
    this.data = cause?.response?.data;
    this.request = request;
  }
}

/**
 * Transform API error codes to the values used in the frontend.
 * This is done to ensure decoupling of frontend from the protocol.
 * See server.api.constants.ValidationErrors on Backend.
 */
function transformFields(fields) {
  lodash.transform(fields, (result, value, key) => {
    switch (value) {
      case "UNIQUE_VIOLATION":
        result[key] = ValidationError.UNIQUE_VIOLATION;
        return;
      case "MISSING_REQUIRED":
        result[key] = ValidationError.MISSING_REQUIRED;
        return;
      default:
        result[key] = ValidationError.INVALID_VALUE;
    }
  });
}

/**
 * Request data validation error.
 */
export class ValidationError extends ServerError {
  static UNIQUE_VIOLATION = "UNIQUE_VIOLATION";
  static MISSING_REQUIRED = "MISSING_REQUIRED";
  static INVALID_TYPE = "INVALID_TYPE";
  static INVALID_FORMAT = "INVALID_FORMAT";
  static INVALID_VALUE = "INVALID_VALUE";

  constructor(message, cause, request) {
    super(message, cause, request, fields);
    this.fields = fields || transformFields(this.data?.fields) || {};
  }
}

/**
 * Create a ServerError representing unsuccessful API call.
 * @param message error message
 * @param cause root-cause error instance
 * @param request API request arguments.
 * @returns {ServerError}
 */
export function makeServerError(message, cause, request) {
  if (cause?.response?.data?.fields != null) {
    return new ValidationError(message, cause, request);
  }
  return new ServerError(message, cause, request);
}
