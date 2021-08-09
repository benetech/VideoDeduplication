import TemplatesTransformer from "./transformers/TemplatesTransformer";
import { makeServerError } from "../ServerError";
import getEntityId from "../../../lib/helpers/getEntityId";

export default class TemplateMatchesEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new TemplatesTransformer();
  }

  /**
   * List template matches;
   * @param {{
   *   limit: number|undefined,
   *   offset: number|undefined,
   *   fields: string[],
   *   filters: TemplateMatchFilters
   * }} options
   * @return {Promise<{total, offset, templateMatches, templates: Template[], files: *[]}>}
   */
  async list(options = {}) {
    const {
      limit = 1000,
      offset = 0,
      fields = ["template", "file"],
      filters = {},
    } = options;

    try {
      const response = await this.axios.get(`/template_matches/`, {
        params: {
          limit,
          offset,
          ...this.transform.matchesParams(filters, fields),
        },
      });
      return this.transform.matches(response.data);
    } catch (error) {
      throw makeServerError("Get template-matches error.", error, options);
    }
  }

  /**
   * Get template match by id.
   * @param {number|string} id template id.
   * @param {{
   *   fields: string[],
   * }} options
   * @return {Promise<TemplateMatch>}
   */
  async get(id, options = {}) {
    try {
      const { fields = ["template", "file"] } = options;
      const response = await this.axios.get(`/template_matches/${id}`, {
        params: {
          ...this.transform.matchesParams(null, fields),
        },
      });
      return this.transform.match(response.data);
    } catch (error) {
      throw makeServerError("Get template-match error.", error, {
        id,
        options,
      });
    }
  }

  /**
   * Update template match.
   * @param {TemplateMatch} match template match object
   * @return {Promise<TemplateMatch>}
   */
  async update(match) {
    try {
      const response = await this.axios.patch(
        `/template_matches/${match.id}`,
        JSON.stringify(this.transform.updateMatchDTO(match)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.match(response.data);
    } catch (error) {
      throw makeServerError("Update template-match error.", error, { match });
    }
  }

  /**
   * Delete template match.
   * @param {number|string|TemplateMatch} match template match or id.
   * @return {Promise<void>}
   */
  async delete(match) {
    try {
      await this.axios.delete(`/template_matches/${getEntityId(match)}`);
    } catch (error) {
      throw makeServerError("Delete object error.", error, { match });
    }
  }
}
