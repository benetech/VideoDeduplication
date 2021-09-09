import TemplatesTransformer from "./transformers/TemplatesTransformer";
import { makeServerError } from "../ServerError";
import getEntityId from "../../../lib/helpers/getEntityId";

export default class TemplateMatchesEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new TemplatesTransformer();
  }

  /**
   * @typedef {{
   *   limit: number|undefined,
   *   offset: number|undefined,
   *   fields: string[],
   *   filters: TemplateMatchFilters
   * }} ListTemplateMatchesOptions
   */

  /**
   * List template matches;
   * @param {ListTemplateMatchesOptions} options
   * @return {Promise<ListTemplateMatchesResults>}
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
      return this.transform.matches(response.data, options);
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
   * @return {Promise<ObjectEntity>}
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
   * @param {ObjectEntity} match template match object
   * @return {Promise<ObjectEntity>}
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
   * @param {number|string|ObjectEntity} match template match or id.
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
