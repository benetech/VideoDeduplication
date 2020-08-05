import axios from "axios";
import * as HttpStatus from "http-status-codes";
import Transform from "./Transform";
import { Response } from "../Response";

export default class Server {
  constructor({ baseURL = "/api/v1", timeout = 10 * 1000, headers = {} } = {}) {
    this.axios = axios.create({
      baseURL,
      timeout,
      headers,
    });
    this.transform = new Transform();
  }

  async fetchFiles() {
    try {
      const response = await this.axios.get("/videometadata/");
      const data = this.transform.fetchFileResults(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  errorResponse(error) {
    if (error.response == null) {
      return Response.clientError(error);
    }
    const response = error.response;
    switch (response.status) {
      case HttpStatus.BAD_REQUEST:
        return Response.invalid(error);
      case HttpStatus.UNAUTHORIZED:
        return Response.unauthorized(error);
      case HttpStatus.NOT_FOUND:
        return Response.notFound(error);
      default:
        return Response.clientError(error);
    }
  }
}
