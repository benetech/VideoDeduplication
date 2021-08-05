import { makeServerError } from "../ServerError";
import TemplateExclusionsTransformer from "./TemplateExclusionsTransformer";
import getEntityId from "../helpers/getEntityId";

/**
 * Client for template exclusions API endpoint.
 */
export default class TemplateExclusionsEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new TemplateExclusionsTransformer();
  }

  /**
   * Create new template exclusion.
   * @param {TemplateExclusion} exclusion template-exclusion object to be created.
   * @return {Promise<TemplateExclusion>}
   */
  async create(exclusion) {
    try {
      const newExclusionDTO = this.transform.newExclusionDTO(exclusion);
      const response = await this.axios.post(
        "/template-file-exclusions/",
        JSON.stringify(newExclusionDTO),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.exclusion(response.data);
    } catch (error) {
      throw makeServerError("Create file exclusion error.", error, {
        exclusion,
      });
    }
  }

  /**
   * List template exclusions.
   * @param {{
   *   limit: number|undefined,
   *   offset: number|undefined,
   *   filters: TemplateExclusionFilters,
   * }} options
   * @return {Promise<{total, offset, exclusions: TemplateExclusion[]}>}
   */
  async list(options = {}) {
    try {
      const { limit = 1000, offset = 0, filters = {} } = options;
      const response = await this.axios.get("/template-file-exclusions/", {
        params: {
          limit,
          offset,
          ...this.transform.listParams(filters),
        },
      });
      return this.transform.exclusions(response.data);
    } catch (error) {
      throw makeServerError("Fetch file exclusions error.", error, { options });
    }
  }

  /**
   * Get template-exclusion by id.
   * @param {number|string} id template exclusion id.
   * @return {Promise<TemplateExclusion>}
   */
  async get(id) {
    try {
      const response = await this.axios.get(`/template-file-exclusions/${id}`);
      return this.transform.exclusion(response.data);
    } catch (error) {
      throw makeServerError("Fetch file exclusion error.", error, { id });
    }
  }

  /**
   * Delete template exclusion.
   * @param {number|string|TemplateExclusion} exclusion id or exclusion to be deleted
   * @return {Promise<void>}
   */
  async delete(exclusion) {
    try {
      await this.axios.delete(
        `/template-file-exclusions/${getEntityId(exclusion)}`
      );
    } catch (error) {
      throw makeServerError("Delete file exclusion error.", error, {
        preset: exclusion,
      });
    }
  }
}