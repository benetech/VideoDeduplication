import { makeServerError } from "../ServerError";
import TemplatesTransformer from "./TemplatesTransformer";
import getEntityId from "../helpers/getEntityId";

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
   * @return {Promise<Template>}
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
   * Query templates list.
   * @param {{
   *   limit: number,
   *   offset: number,
   *   fields: string[],
   *   filters: TemplateFilters,
   * }} options query options
   * @return {Promise<{total: number, offset: number, templates: [*]}>}
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
      return this.transform.templates(response.data);
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
   * @param template
   * @return {Promise<Template>}
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
   * @param {number|string|Template} template template to be deleted
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