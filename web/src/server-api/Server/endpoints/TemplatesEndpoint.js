import { makeServerError } from "../ServerError";
import TemplatesTransformer from "./transformers/TemplatesTransformer";
import getEntityId from "../../../lib/helpers/getEntityId";

/**
 * Client for templates API endpoint.
 */
export default class TemplatesEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new TemplatesTransformer();
  }

  /**
   * Create new template.
   * @param template template object to be created.
   * @return {Promise<TemplateEntity>}
   */
  async create(template) {
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
   * @typedef {{
   *   limit: number,
   *   offset: number,
   *   fields: string[],
   *   filters: TemplateFilters,
   * }} ListTemplatesOptions
   */

  /**
   * Query templates list.
   * @param {ListTemplatesOptions} options query options
   * @return {Promise<ListTemplatesResults>}
   */
  async list(options = {}) {
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
          ...this.transform.listParams(filters, fields),
        },
      });
      return this.transform.templates(response.data, options);
    } catch (error) {
      throw makeServerError("Fetch templates error.", error, { options });
    }
  }

  /**
   * Fetch single template by id.
   * @param id template id
   * @param {{fields: string[]}} options fetch options.
   * @return {Promise<TemplateEntity>}
   */
  async get(id, options = {}) {
    try {
      const { fields = ["examples"] } = options;
      const response = await this.axios.get(`/templates/${id}`, {
        params: {
          ...this.transform.listParams(null, fields),
        },
      });
      return this.transform.template(response.data);
    } catch (error) {
      throw makeServerError("Fetch template error.", error, { id, options });
    }
  }

  /**
   * Update template.
   * @param {TemplateEntity} template
   * @return {Promise<TemplateEntity>}
   */
  async update(template) {
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

  /**
   * Delete template by id
   * @param {number|string|TemplateEntity} template template to be deleted
   * @return {Promise<void>}
   */
  async delete(template) {
    try {
      await this.axios.delete(`/templates/${getEntityId(template)}`);
    } catch (error) {
      throw makeServerError("Delete template error.", error, { id: template });
    }
  }
}
