import axios from "axios";
import * as HttpStatus from "http-status-codes";
import Transform from "./Transform";
import { Response } from "../Response";
import { filtersToQueryParams } from "./helpers";

export default class Server {
  constructor({ baseURL = "/api/v1", timeout = 10 * 1000, headers = {} } = {}) {
    this.axios = axios.create({
      baseURL,
      timeout,
      headers,
    });
    this.transform = new Transform();
  }

  async fetchFiles({ page, pageSize, filters }) {
    try {
      const response = await this.axios.get("/files/", {
        params: {
          offset: page * pageSize,
          limit: pageSize,
          include: ["signature", "meta", "scenes"].join(","),
          ...filtersToQueryParams(filters),
        },
      });
      const data = this.transform.fetchFileResults(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchFile({ id }) {
    try {
      const response = await this.axios.get(`/files/${id}`, {
        params: {
          include: ["signature", "meta", "scenes", "exif"].join(","),
        },
      });
      const data = this.transform.videoFile(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchFileMatches({ id, limit = 20, offset = 0 }) {
    try {
      const response = await this.axios.get(`/files/${id}/matches`, {
        params: {
          limit,
          offset,
        },
      });
      const data = this.transform.fetchFileMatchesResults(response.data);
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
