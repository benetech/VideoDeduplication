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
import templateFiltersToQueryParams from "./helpers/templateFiltersToQueryParams";
import exampleFiltersToQueryParams from "./helpers/exampleFiltersToQueryParams";
import templateMatchFiltersToQueryParams from "./helpers/templateMatchFiltersToQueryParams";
import AxiosRetry from "axios-retry";
import presetFiltersToQueryParams from "./helpers/presetFiltersToQueryParams";
import ServerError, { makeServerError } from "./ServerError";

export default class Server {
  constructor({
    baseURL = "/api/v1",
    timeout = 10 * 1000,
    retries = 5,
    headers = {},
  } = {}) {
    this.axios = axios.create({
      baseURL,
      timeout,
      headers,
    });
    AxiosRetry(this.axios, {
      retries,
      retryDelay: AxiosRetry.exponentialDelay,
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
        JSON.stringify(this.transform.toTaskRequestDTO(request)),
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

  async createTemplate({ template }) {
    try {
      const newTemplateDTO = this.transform.newTemplateDTO(template);
      const response = await this.axios.post(
        `/templates/`,
        JSON.stringify(newTemplateDTO),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return Response.ok(this.transform.template(response.data));
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchTemplates({
    limit = 1000,
    offset = 0,
    fields = ["examples", "file_count"],
    filters = {},
  }) {
    try {
      const response = await this.axios.get(`/templates/`, {
        params: {
          limit,
          offset,
          ...templateFiltersToQueryParams({ fields, filters }),
        },
      });
      const data = this.transform.fetchTemplatesResults(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchTemplate({ id, fields = ["examples"] }) {
    try {
      const response = await this.axios.get(`/templates/${id}`, {
        params: {
          ...templateFiltersToQueryParams({ fields }),
        },
      });
      const data = this.transform.template(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async updateTemplate({ template }) {
    try {
      const response = await this.axios.patch(
        `/templates/${template.id}`,
        JSON.stringify({
          name: template.name,
          icon_type: template.icon?.kind,
          icon_key: template.icon?.key,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return Response.ok(this.transform.template(response.data));
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async deleteTemplate({ id }) {
    try {
      const response = await this.axios.delete(`/templates/${id}`);
      return Response.ok(response.data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchExamples({
    limit = 1000,
    offset = 0,
    fields = ["template"],
    filters = {},
  }) {
    try {
      const response = await this.axios.get(`/examples/`, {
        params: {
          limit,
          offset,
          ...exampleFiltersToQueryParams({ fields, filters }),
        },
      });
      const data = this.transform.fetchExamplesResults(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchExample({ id, fields = ["template"] }) {
    try {
      const response = await this.axios.get(`/examples/${id}`, {
        params: {
          ...exampleFiltersToQueryParams({ fields }),
        },
      });
      const data = this.transform.template(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async uploadExample({ templateId, file }) {
    try {
      let formData = new FormData();
      formData.append("file", file);

      const response = await this.axios.post(
        `/templates/${templateId}/examples/`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            let percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(
              `${file.name} uploading completed on ${percentCompleted}%`
            );
          },
        }
      );
      const data = this.transform.templateExample(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async deleteExample({ id }) {
    try {
      const response = await this.axios.delete(`/examples/${id}`);
      return Response.ok(response.data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchTemplateMatches({
    limit = 1000,
    offset = 0,
    fields = ["template", "file"],
    filters = {},
  }) {
    try {
      const response = await this.axios.get(`/template_matches/`, {
        params: {
          limit,
          offset,
          ...templateMatchFiltersToQueryParams({ fields, filters }),
        },
      });
      const data = this.transform.fetchTemplateMatchesResults(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async fetchTemplateMatch({ id, fields = ["template", "file"] }) {
    try {
      const response = await this.axios.get(`/template_matches/${id}`, {
        params: {
          ...templateMatchFiltersToQueryParams({ fields }),
        },
      });
      const data = this.transform.template(response.data);
      return Response.ok(data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async deleteTemplateMatch({ id }) {
    try {
      const response = await this.axios.delete(`/template_matches/${id}`);
      return Response.ok(response.data);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  async createPreset({ preset }) {
    try {
      const newPresetDTO = this.transform.newPresetDTO(preset);
      const response = await this.axios.post(
        "/files/filter-presets/",
        JSON.stringify(newPresetDTO),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.preset(response.data);
    } catch (error) {
      const request = { preset };
      throw makeServerError("Create preset error.", error, request);
    }
  }

  async fetchPresets({ limit = 1000, offset = 0, filters = {} }) {
    try {
      const response = await this.axios.get("/files/filter-presets/", {
        params: {
          limit,
          offset,
          ...presetFiltersToQueryParams({ filters }),
        },
      });
      return this.transform.fetchPresetResults(response.data);
    } catch (error) {
      const request = { limit, offset, filters };
      throw makeServerError("Fetch presets error.", error, request);
    }
  }

  async fetchPreset({ id }) {
    try {
      const response = await this.axios.get(`/files/filter-presets/${id}`);
      return this.transform.preset(response.data);
    } catch (error) {
      const request = { id };
      throw makeServerError("Fetch preset error.", error, request);
    }
  }

  async updatePreset({ preset }) {
    try {
      const response = await this.axios.patch(
        `/files/filter-presets/${preset.id}`,
        JSON.stringify(this.transform.updatePresetDTO(preset)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.preset(response.data);
    } catch (error) {
      const request = { preset };
      throw makeServerError("Update preset error.", error, request);
    }
  }

  async deletePreset({ id }) {
    try {
      await this.axios.delete(`/files/filter-presets/${id}`);
    } catch (error) {
      const request = { id };
      throw makeServerError("Delete preset error.", error, request);
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
