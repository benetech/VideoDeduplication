import axios from "axios";
import io from "socket.io-client";
import Transform from "./Transform";
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
import { makeServerError } from "./ServerError";
import templateFileExclusionFiltersToQueryParams from "./helpers/templateFileExclusionFiltersToQueryParams";

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

  /**
   * Fetch file list.
   * @param {{
   *   limit:number,
   *   offset:number,
   *   filters:Object
   * }} options query options
   * @returns {Promise<{counts, files}>}
   */
  async fetchFiles(options = {}) {
    try {
      const { limit = 100, offset = 0, filters = {} } = options;
      const response = await this.axios.get("/files/", {
        params: {
          offset,
          limit,
          include: ["signature", "meta", "exif"].join(","),
          ...fileFiltersToQueryParams(filters),
        },
      });
      return this.transform.fetchFileResults(response.data);
    } catch (error) {
      throw makeServerError("Fetch files error.", error, { options });
    }
  }

  async fetchFile(id) {
    try {
      const response = await this.axios.get(`/files/${id}`, {
        params: {
          include: ["signature", "meta", "scenes", "exif"].join(","),
        },
      });
      return this.transform.videoFile(response.data);
    } catch (error) {
      throw makeServerError("Fetch file error.", error, { id });
    }
  }

  /**
   * Query file's neighbors.
   * @param {{
   *   fieldId:number,
   *   limit:number,
   *   offset:number,
   *   fields:string[],
   *   filters:Object
   * }} options query options.
   * @returns {Promise<{total, files, matches}>}
   */
  async fetchFileCluster(options = {}) {
    try {
      const { fileId, limit = 20, offset = 0, fields = [], filters } = options;
      const response = await this.axios.get(`/files/${fileId}/cluster`, {
        params: {
          limit,
          offset,
          ...clusterFiltersToQueryParams({ filters, fields }),
        },
      });
      return this.transform.fetchFileClusterResults(response.data);
    } catch (error) {
      throw makeServerError("Fetch file cluster error.", error, { options });
    }
  }

  /**
   * List file matches.
   * @param {{
   *   fieldId,
   *   limit: number,
   *   offset: number,
   *   fields: string[],
   *   filters: Object,
   * }} options query options
   * @returns {Promise<{total, offset, matches}>}
   */
  async fetchFileMatches(options = {}) {
    try {
      const {
        fileId,
        limit = 20,
        offset = 0,
        fields = ["meta", "exif", "scenes"],
        filters = {
          remote: false,
        },
      } = options;
      const response = await this.axios.get(`/files/${fileId}/matches`, {
        params: {
          limit,
          offset,
          ...matchesFiltersToQueryParams({ filters, fields }),
        },
      });
      return this.transform.fetchFileMatchesResults(response.data);
    } catch (error) {
      throw makeServerError("Fetch file matches error.", error, { options });
    }
  }

  async updateMatch(match) {
    try {
      const response = await this.axios.patch(
        `/matches/${match.id}`,
        JSON.stringify(this.transform.updateMatchDTO(match)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.match(response.data);
    } catch (error) {
      throw makeServerError("Update match error.", error, { match });
    }
  }

  async probeVideoFile(id) {
    try {
      await this.axios.head(`/files/${id}/watch`);
    } catch (error) {
      throw makeServerError("Probe video error.", error, { id });
    }
  }

  /**
   * Query task list.
   * @param {{
   *   limit: number,
   *   offset: number,
   *   filters: Object,
   * }} options query options
   * @returns {Promise<{total, offset, tasks}>}
   */
  async fetchTasks(options = {}) {
    try {
      const { limit = 1000, offset = 0, filters = {} } = options;
      const response = await this.axios.get(`/tasks/`, {
        params: {
          limit,
          offset,
          ...taskFiltersToQueryParams({ filters }),
        },
      });
      return this.transform.fetchTasksResults(response.data);
    } catch (error) {
      throw makeServerError("Fetch tasks error.", error, { options });
    }
  }

  async fetchTask(id) {
    try {
      const response = await this.axios.get(`/tasks/${id}`, {
        params: {},
      });
      return this.transform.task(response.data);
    } catch (error) {
      throw makeServerError("Fetch task error.", error, { id });
    }
  }

  async fetchLogs(id) {
    try {
      const response = await this.axios.get(`/tasks/${id}/logs`, {
        params: {},
      });
      return response.data;
    } catch (error) {
      throw makeServerError("Fetch logs error.", error, { id });
    }
  }

  async deleteTask(id) {
    try {
      const response = await this.axios.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw makeServerError("Delete task error.", error, { id });
    }
  }

  async cancelTask(id) {
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
      return this.transform.task(response.data);
    } catch (error) {
      throw makeServerError("Cancel task error.", error, { id });
    }
  }

  async createTask(request) {
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
      return this.transform.task(response.data);
    } catch (error) {
      throw makeServerError("Create task error.", error, { request });
    }
  }

  async createTemplate(template) {
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
      return this.transform.template(response.data);
    } catch (error) {
      throw makeServerError("Create template error.", error, { template });
    }
  }

  /**
   * Query templates list.
   * @param {{
   *   limit: number,
   *   offset: number,
   *   fields: string[],
   *   filters: Object,
   * }} options query options
   * @return {Promise<{total: number, offset: number, templates: [*]}>}
   */
  async fetchTemplates(options = {}) {
    try {
      const {
        limit = 1000,
        offset = 0,
        fields = ["examples", "file_count"],
        filters = {},
      } = options;
      const response = await this.axios.get(`/templates/`, {
        params: {
          limit,
          offset,
          ...templateFiltersToQueryParams({ fields, filters }),
        },
      });
      return this.transform.fetchTemplatesResults(response.data);
    } catch (error) {
      throw makeServerError("Fetch templates error.", error, { options });
    }
  }

  /**
   * Fetch single template by id.
   * @param id template id
   * @param {{fields: string[]}} options fetch options.
   * @return {Promise}
   */
  async fetchTemplate(id, options = {}) {
    try {
      const { fields = ["examples"] } = options;
      const response = await this.axios.get(`/templates/${id}`, {
        params: {
          ...templateFiltersToQueryParams({ fields }),
        },
      });
      return this.transform.template(response.data);
    } catch (error) {
      throw makeServerError("Fetch template error.", error, { id, options });
    }
  }

  async updateTemplate(template) {
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
      return this.transform.template(response.data);
    } catch (error) {
      throw makeServerError("Update template error.", error, { template });
    }
  }

  async deleteTemplate(id) {
    try {
      const response = await this.axios.delete(`/templates/${id}`);
      return response.data;
    } catch (error) {
      throw makeServerError("Delete template error.", error, { id });
    }
  }

  /**
   * Query examples list.
   * @param {{
   *   limit: number,
   *   offset: number,
   *   fields: string[],
   *   filters: Object,
   * }} options query options
   * @return {Promise<{total, offset, examples}>}
   */
  async fetchExamples(options = {}) {
    try {
      const {
        limit = 1000,
        offset = 0,
        fields = ["template"],
        filters = {},
      } = options;
      const response = await this.axios.get(`/examples/`, {
        params: {
          limit,
          offset,
          ...exampleFiltersToQueryParams({ fields, filters }),
        },
      });
      return this.transform.fetchExamplesResults(response.data);
    } catch (error) {
      throw makeServerError("Fetch examples error.", error, { options });
    }
  }

  /**
   * Fetch a single template example by id.
   * @param id example id
   * @param {{fields: string[]}} options fetch options
   * @return {Promise}
   */
  async fetchExample(id, options = {}) {
    try {
      const { fields = ["template"] } = options;
      const response = await this.axios.get(`/examples/${id}`, {
        params: {
          ...exampleFiltersToQueryParams({ fields }),
        },
      });
      return this.transform.template(response.data);
    } catch (error) {
      throw makeServerError("Fetch examples error.", error, { id, options });
    }
  }

  async uploadExample(templateId, file) {
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
      return this.transform.templateExample(response.data);
    } catch (error) {
      throw makeServerError("Upload example error.", error, {
        templateId,
        file,
      });
    }
  }

  async deleteExample(id) {
    try {
      const response = await this.axios.delete(`/examples/${id}`);
      return response.data;
    } catch (error) {
      throw makeServerError("Delete example error.", error, { id });
    }
  }

  async fetchTemplateMatches(request) {
    const {
      limit = 1000,
      offset = 0,
      fields = ["template", "file"],
      filters = {},
    } = request;

    try {
      const response = await this.axios.get(`/template_matches/`, {
        params: {
          limit,
          offset,
          ...templateMatchFiltersToQueryParams({ fields, filters }),
        },
      });
      return this.transform.fetchTemplateMatchesResults(response.data);
    } catch (error) {
      throw makeServerError("Get template-matches error.", error, request);
    }
  }

  async fetchTemplateMatch(id, fields = ["template", "file"]) {
    try {
      const response = await this.axios.get(`/template_matches/${id}`, {
        params: {
          ...templateMatchFiltersToQueryParams({ fields }),
        },
      });
      return this.transform.template(response.data);
    } catch (error) {
      const request = { id, fields };
      throw makeServerError("Get template-match error.", error, request);
    }
  }

  async updateTemplateMatch(match) {
    try {
      const response = await this.axios.patch(
        `/template_matches/${match.id}`,
        JSON.stringify(this.transform.updateTemplateMatchDTO(match)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.templateMatch(response.data);
    } catch (error) {
      throw makeServerError("Update template-match error.", error, { match });
    }
  }

  async deleteTemplateMatch(match) {
    try {
      await this.axios.delete(`/template_matches/${match.id}`);
    } catch (error) {
      throw makeServerError("Delete object error.", error, { match });
    }
  }

  async createPreset(preset) {
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
      throw makeServerError("Create preset error.", error, { preset });
    }
  }

  async fetchPresets(options = {}) {
    try {
      const { limit = 1000, offset = 0, filters = {} } = options;
      const response = await this.axios.get("/files/filter-presets/", {
        params: {
          limit,
          offset,
          ...presetFiltersToQueryParams({ filters }),
        },
      });
      return this.transform.fetchPresetResults(response.data);
    } catch (error) {
      throw makeServerError("Fetch presets error.", error, { options });
    }
  }

  async fetchPreset(id) {
    try {
      const response = await this.axios.get(`/files/filter-presets/${id}`);
      return this.transform.preset(response.data);
    } catch (error) {
      throw makeServerError("Fetch preset error.", error, { id });
    }
  }

  async updatePreset(preset) {
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
      throw makeServerError("Update preset error.", error, { preset });
    }
  }

  async deletePreset(preset) {
    try {
      await this.axios.delete(`/files/filter-presets/${preset.id}`);
    } catch (error) {
      throw makeServerError("Delete preset error.", error, { preset });
    }
  }

  async createTemplateFileExclusion(exclusion) {
    try {
      const newExclusionDTO =
        this.transform.newTemplateFileExclusionDTO(exclusion);
      const response = await this.axios.post(
        "/template-file-exclusions/",
        JSON.stringify(newExclusionDTO),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.templateFileExclusion(response.data);
    } catch (error) {
      throw makeServerError("Create file exclusion error.", error, {
        exclusion,
      });
    }
  }

  async fetchTemplateFileExclusions(options = {}) {
    try {
      const { limit = 1000, offset = 0, filters = {} } = options;
      const response = await this.axios.get("/template-file-exclusions/", {
        params: {
          limit,
          offset,
          ...templateFileExclusionFiltersToQueryParams({ filters }),
        },
      });
      return this.transform.fetchTemplateFileExclusionsResults(response.data);
    } catch (error) {
      throw makeServerError("Fetch file exclusions error.", error, { options });
    }
  }

  async fetchTemplateFileExclusion(id) {
    try {
      const response = await this.axios.get(`/template-file-exclusions/${id}`);
      return this.transform.templateFileExclusion(response.data);
    } catch (error) {
      throw makeServerError("Fetch file exclusion error.", error, { id });
    }
  }

  async deleteTemplateFileExclusion(exclusion) {
    try {
      await this.axios.delete(`/template-file-exclusions/${exclusion.id}`);
    } catch (error) {
      throw makeServerError("Delete file exclusion error.", error, {
        preset: exclusion,
      });
    }
  }

  /**
   * Get predefined application statistics by name.
   * @param name statistics name.
   *
   * Available statistics names:
   *  - **extensions** - list of the existing file extensions.
   */
  async fetchStats({ name }) {
    try {
      const response = await this.axios.get(`/stats/${name}`);
      return this.transform.statistics(name, response.data);
    } catch (error) {
      throw makeServerError("Fetch file exclusion error.", error, { name });
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
}
