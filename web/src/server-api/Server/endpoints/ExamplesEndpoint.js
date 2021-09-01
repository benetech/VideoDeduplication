import TemplatesTransformer from "./transformers/TemplatesTransformer";
import { makeServerError } from "../ServerError";
import getEntityId from "../../../lib/helpers/getEntityId";

/**
 * Client for examples API endpoint.
 */
export default class ExamplesEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new TemplatesTransformer();
  }

  /**
   * Query examples list.
   * @param {{
   *   limit: number,
   *   offset: number,
   *   fields: string[],
   *   filters: ExampleFilters,
   * }} options query options
   * @return {Promise<{total:number, offset:number, examples:TemplateExampleEntity[]}>}
   */
  async list(options = {}) {
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
          ...this.transform.exampleParams(filters, fields),
        },
      });
      return this.transform.examples(response.data);
    } catch (error) {
      throw makeServerError("Fetch examples error.", error, { options });
    }
  }

  /**
   * Fetch a single template example by id.
   * @param id example id
   * @param {{fields: string[]}} options fetch options
   * @return {Promise<TemplateExampleEntity>}
   */
  async get(id, options = {}) {
    try {
      const { fields = ["template"] } = options;
      const response = await this.axios.get(`/examples/${id}`, {
        params: {
          ...this.transform.exampleParams(null, fields),
        },
      });
      return this.transform.example(response.data);
    } catch (error) {
      throw makeServerError("Fetch examples error.", error, { id, options });
    }
  }

  /**
   * Upload a new template example.
   * @param {TemplateEntity|string|number} template
   * @param file
   * @return {Promise<TemplateExampleEntity>}
   */
  async upload(template, file) {
    try {
      let formData = new FormData();
      formData.append("file", file);

      const response = await this.axios.post(
        `/templates/${getEntityId(template)}/examples/`,
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
      return this.transform.example(response.data);
    } catch (error) {
      throw makeServerError("Upload example error.", error, {
        templateId: template,
        file,
      });
    }
  }

  /**
   * Create template example from video file frame.
   * @param {TemplateEntity|string|number} template template to add example
   * @param {FileEntity|string|number} file file to extract frame
   * @param {number} time time position in milliseconds
   * @return {Promise<TemplateExampleEntity>}
   */
  async createFromFrame({ template, file, time }) {
    try {
      const frameDTO = this.transform.frameDTO({ file, time });
      const response = await this.axios.post(
        `/templates/${getEntityId(template)}/examples/`,
        JSON.stringify(frameDTO),
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            method: "frame",
          },
        }
      );
      return this.transform.example(response.data);
    } catch (error) {
      throw makeServerError("Create example from frame error.", error, {
        template,
        file,
        time,
      });
    }
  }

  /**
   * Delete template example by id.
   * @param {number|string|TemplateExampleEntity} example template example or example id
   * @return {Promise<void>}
   */
  async delete(example) {
    try {
      await this.axios.delete(`/examples/${getEntityId(example)}`);
    } catch (error) {
      throw makeServerError("Delete example error.", error, { example });
    }
  }
}
