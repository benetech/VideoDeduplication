import { AxiosInstance } from "axios";
import getEntityId from "../../../lib/entity/getEntityId";
import TemplatesTransformer from "../transform/TemplatesTransformer";
import { makeServerError } from "../../ServerError";
import {
  FrameToExampleParams,
  ListOptions,
  ListRequest,
  ListResults,
  TemplateExamplesAPI,
} from "../../ServerAPI";
import {
  Template,
  TemplateExample,
  TemplateExampleFilters,
} from "../../../model/Template";
import { QueryResultsDTO } from "../dto/query";
import { TemplateExampleDTO } from "../dto/templates";

/**
 * Client for examples API endpoint.
 */
export default class ExamplesEndpoint implements TemplateExamplesAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: TemplatesTransformer;

  constructor(axios: AxiosInstance, transform?: TemplatesTransformer) {
    this.axios = axios;
    this.transform = transform || new TemplatesTransformer();
  }

  /**
   * Query examples list.
   */
  async list(
    options: ListOptions<TemplateExampleFilters> = {}
  ): Promise<ListResults<TemplateExample, TemplateExampleFilters>> {
    try {
      const request = ExamplesEndpoint.completeRequest(options);
      const { limit, offset, fields, filters } = request;
      const response = await this.axios.get<
        QueryResultsDTO<TemplateExampleDTO>
      >(`/examples/`, {
        params: {
          limit,
          offset,
          ...this.transform.exampleParams(filters, fields),
        },
      });
      return this.transform.examples(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch examples error.", error, { options });
    }
  }

  /**
   * Fetch a single template example by id.
   */
  async get(
    id: TemplateExample["id"],
    fields: string[] = ["template"]
  ): Promise<TemplateExample> {
    try {
      const response = await this.axios.get(`/examples/${id}`, {
        params: {
          ...this.transform.exampleParams(null, fields),
        },
      });
      return this.transform.example(response.data);
    } catch (error) {
      throw makeServerError("Fetch examples error.", error, { id, fields });
    }
  }

  /**
   * Upload a new template example.
   */
  async upload(template: Template, file: File): Promise<TemplateExample> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.axios.post(
        `/templates/${getEntityId(template)}/examples/`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
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
   */
  async createFromFrame(
    params: FrameToExampleParams
  ): Promise<TemplateExample> {
    try {
      const { file, time, template } = params;
      const frameDTO = this.transform.frameDTO(file, time);
      const response = await this.axios.post<TemplateExampleDTO>(
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
      throw makeServerError("Create example from frame error.", error, params);
    }
  }

  /**
   * Delete template example by id.
   */
  async delete(
    example: TemplateExample | TemplateExample["id"]
  ): Promise<void> {
    try {
      await this.axios.delete(`/examples/${getEntityId(example)}`);
    } catch (error) {
      throw makeServerError("Delete example error.", error, { example });
    }
  }

  private static completeRequest(
    options: ListOptions<TemplateExampleFilters>
  ): ListRequest<TemplateExampleFilters> {
    return Object.assign(
      {
        limit: 1000,
        offset: 0,
        fields: ["template"],
        filters: {},
      },
      options
    );
  }
}
