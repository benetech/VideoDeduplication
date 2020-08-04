export const Status = {
  /**
   * Success
   */
  OK: 1,

  /**
   * Resource in question not found
   */
  NOT_FOUND: 2,

  /**
   * Invalid request
   */
  INVALID_REQUEST: 3,

  /**
   * Internal server error
   */
  SERVER_ERROR: 4,

  /**
   * Authentication required or not enough permissions
   */
  UNAUTHORIZED: 5,

  /**
   * Control flow error on client side
   */
  CLIENT_ERROR: 7,

  /**
   * Network error, service is not available
   */
  UNAVAILABLE: 8,
};

export class Response {
  constructor(status, data, error) {
    this.status = status;
    this.data = data;
    this.error = error;
  }

  get success() {
    return this.status === Status.OK;
  }

  get failure() {
    return !this.success;
  }

  static ok(data) {
    return new Response(Status.OK, data);
  }

  static fail(status, error) {
    return new Response(status, null, error);
  }

  static invalid(error) {
    return Response.fail(Status.INVALID_REQUEST, error);
  }

  static notFound(error) {
    return Response.fail(Status.NOT_FOUND, error);
  }

  static serverError(error) {
    return Response.fail(Status.SERVER_ERROR, error);
  }

  static clientError(error) {
    return Response.fail(Status.CLIENT_ERROR, error);
  }

  static unavailable(error) {
    return Response.fail(Status.UNAVAILABLE, error);
  }

  static unauthorized(error) {
    return Response.fail(Status.UNAUTHORIZED, error);
  }
}
