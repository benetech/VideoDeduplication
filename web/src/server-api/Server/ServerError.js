import * as HttpStatus from "http-status-codes";
import lodash from "lodash";

/**
 * Determine error status.
 */
function errorCode(error) {
  if (error?.response == null) {
    return ServerError.CLIENT_ERROR;
  }
  const response = error.response;
  switch (response.status) {
    case HttpStatus.BAD_REQUEST:
      return ServerError.INVALID_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return ServerError.UNAUTHORIZED;
    case HttpStatus.NOT_FOUND:
      return ServerError.NOT_FOUND;
    default:
      return ServerError.CLIENT_ERROR;
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
   * Entity not found.
   */
  static NOT_FOUND = 2;

  /**
   * Invalid request.
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
    if (cause?.stack != null) {
      this.stack = cause.stack;
    }
  }
}

/**
 * Transform API error codes to the values used in the frontend.
 * This is done to ensure decoupling of frontend from the protocol.
 * See server.api.constants.ValidationErrors on Backend.
 */
function transformFields(fields) {
  return lodash.transform(fields, (result, value, key) => {
    if (value === "UNIQUE_VIOLATION") {
      result[key] = ValidationError.UNIQUE_VIOLATION;
    } else if (value === "MISSING_REQUIRED") {
      result[key] = ValidationError.MISSING_REQUIRED;
    } else if (value === "OUT_OF_BOUNDS") {
      result[key] = ValidationError.OUT_OF_BOUNDS;
    } else {
      result[key] = ValidationError.INVALID_VALUE;
    }
  });
}

/**
 * Request data validation error.
 */
export class ValidationError extends ServerError {
  /**
   * Error codes for field validation errors.
   * @type {string}
   */
  static UNIQUE_VIOLATION = "UNIQUE_VIOLATION";
  static MISSING_REQUIRED = "MISSING_REQUIRED";
  static INVALID_VALUE = "INVALID_VALUE";
  static OUT_OF_BOUNDS = "OUT_OF_BOUNDS";

  constructor(message, cause, request, fields) {
    super(message, cause, request);
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
