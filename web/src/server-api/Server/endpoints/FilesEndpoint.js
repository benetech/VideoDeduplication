import { makeServerError } from "../ServerError";
import FilesTransformer from "./transformers/FilesTransformer";

/**
 * Client for file API endpoint.
 */
export default class FilesEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new FilesTransformer();
    console.log("Got transformer", this);
  }

  /**
   * Get file list.
   *
   * @param {{
   *   limit: number,
   *   offset: number,
   *   filters: FileFilters,
   * }} options query options
   * @returns {Promise<{counts, files}>}
   */
  async list(options = {}) {
    try {
      const { limit = 100, offset = 0, filters = {} } = options;
      const response = await this.axios.get("/files/", {
        params: {
          offset,
          limit,
          include: ["signature", "meta", "exif"].join(","),
          ...this.transform.listParams(filters),
        },
      });
      return this.transform.files(response.data);
    } catch (error) {
      throw makeServerError("Fetch files error.", error, { options });
    }
  }

  /**
   * Get single file by id.
   * @param id file id
   * @return {Promise<File>}
   */
  async get(id) {
    try {
      const response = await this.axios.get(`/files/${id}`, {
        params: {
          include: ["signature", "meta", "scenes", "exif"].join(","),
        },
      });
      return this.transform.file(response.data);
    } catch (error) {
      throw makeServerError("Fetch file error.", error, { id });
    }
  }

  /**
   * Query file's neighbors.
   *
   * @param {{
   *   fieldId:number,
   *   limit:number,
   *   offset:number,
   *   fields:string[],
   *   filters:ClusterFilters
   * }} options query options.
   * @returns {Promise<{total, files, matches}>}
   */
  async cluster(options = {}) {
    try {
      const { fileId, limit = 20, offset = 0, fields = [], filters } = options;
      const response = await this.axios.get(`/files/${fileId}/cluster`, {
        params: {
          limit,
          offset,
          ...this.transform.clusterParams(filters, fields),
        },
      });
      return this.transform.cluster(response.data);
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
  async matches(options = {}) {
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
          ...this.transform.matchesParams(filters, fields),
        },
      });
      return this.transform.matches(response.data);
    } catch (error) {
      throw makeServerError("Fetch file matches error.", error, { options });
    }
  }

  /**
   * Check if video file is available for watching.
   * @param id file id
   * @return {Promise<void>}
   */
  async probeVideo(id) {
    try {
      await this.axios.head(`/files/${id}/watch`);
    } catch (error) {
      throw makeServerError("Probe video error.", error, { id });
    }
  }
}
