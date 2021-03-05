import axios from "axios";
import * as HttpStatus from "http-status-codes";
import io from "socket.io-client";
import Transform from "./Transform";
import { Response } from "../Response";
import fileFiltersToQueryParams from "./helpers/fileFiltersToQueryParams";
import clusterFiltersToQueryParams from "./helpers/clusterFiltersToQueryParams";
import matchesFiltersToQueryParams from "./helpers/matchesFiltersToQueryParams";
import taskFiltersToQueryParams from "./helpers/taskFiltersToQueryParams";
import { SocketNamespace, socketPath } from "./constants";
import Socket from "./Socket";

export default class Server {
  constructor({ baseURL = "/api/v1", timeout = 10 * 1000, headers = {} } = {}) {
    this.axios = axios.create({
      baseURL,
      timeout,
      headers,
    });
    this.transform = new Transform();
  }

  async fetchFiles({ limit, offset, filters }) {
    try {
      const response = await this.axios.get("/files/", {
        params: {
          offset,
          limit,
          include: ["signature", "meta", "exif"].join(","),
          ...fileFiltersToQueryParams(filters),
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

  async fetchFileCluster({
    fileId,
    limit = 20,
    offset = 0,
    fields = [],
    filters,
  }) {
    try {
      const response = await this.axios.get(`/files/${fileId}/cluster`, {
        params: {
          limit,
          offset,
          ...clusterFiltersToQueryParams({ filters, fields }),
        },
      });
      const data = this.transform.fetchFileClusterResults(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchFileMatches({
    fileId,
    limit = 20,
    offset = 0,
    fields = ["meta", "exif", "scenes"],
    filters = {
      remote: false,
    },
  }) {
    try {
      const response = await this.axios.get(`/files/${fileId}/matches`, {
        params: {
          limit,
          offset,
          ...matchesFiltersToQueryParams({ filters, fields }),
        },
      });
      const data = this.transform.fetchFileMatchesResults(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async probeVideoFile({ id }) {
    try {
      await this.axios.head(`/files/${id}/watch`);
      return Response.ok(null);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchTasks({ limit = 1000, offset = 0, filters = {} }) {
    try {
      const response = await this.axios.get(`/tasks/`, {
        params: {
          limit,
          offset,
          ...taskFiltersToQueryParams({ filters }),
        },
      });
      const data = this.transform.fetchTasksResults(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchTask({ id }) {
    try {
      const response = await this.axios.get(`/tasks/${id}`, {
        params: {},
      });
      const data = this.transform.task(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchLogs({ id }) {
    try {
      const response = await this.axios.get(`/tasks/${id}/logs`, {
        params: {},
      });
      return Response.ok(response.data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async deleteTask({ id }) {
    try {
      const response = await this.axios.delete(`/tasks/${id}`);
      return Response.ok(response.data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async cancelTask({ id }) {
    try {
      const response = await this.axios.patch(
        `/tasks/${id}`,
        JSON.stringify({ status: "REVOKED" }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return Response.ok(this.transform.task(response.data));
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async createTask({ request }) {
    try {
      const response = await this.axios.post(
        `/tasks/`,
        JSON.stringify(request),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return Response.ok(this.transform.task(response.data));
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Open a new connection for dynamic messaging.
   */
  openMessageChannel() {
    const socketio = io(SocketNamespace.TASKS, {
      path: socketPath,
    });
    return new Socket({
      socket: socketio,
      transform: this.transform,
    });
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
