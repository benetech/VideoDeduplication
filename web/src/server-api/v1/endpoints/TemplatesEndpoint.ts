import { makeServerError } from "../../ServerError";
import TemplatesTransformer from "../transform/TemplatesTransformer";
import getEntityId from "../../../lib/entity/getEntityId";
import {
  ListOptions,
  ListRequest,
  ListResults,
  TemplatesAPI,
} from "../../ServerAPI";
import { AxiosInstance } from "axios";
import { Transient, Updates } from "../../../lib/entity/Entity";
import { Template, TemplateFilters } from "../../../model/Template";
import { QueryResultsDTO } from "../dto/query";
import { TemplateDTO } from "../dto/templates";

/**
 * Client for templates API endpoint.
 */
export default class TemplatesEndpoint implements TemplatesAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: TemplatesTransformer;

  constructor(axios: AxiosInstance, transform?: TemplatesTransformer) {
    this.axios = axios;
    this.transform = transform || new TemplatesTransformer();
  }

  /**
   * Create new template.
   */
  async create(template: Transient<Template>): Promise<Template> {
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
   */
  async list(
    options: ListOptions<TemplateFilters> = {}
  ): Promise<ListResults<Template, TemplateFilters>> {
    try {
      const request = TemplatesEndpoint.completeRequest(options);
      const { limit, offset, fields, filters } = request;
      const response = await this.axios.get<QueryResultsDTO<TemplateDTO>>(
        `/templates/`,
        {
          params: {
            limit,
            offset,
            ...this.transform.listParams(filters, fields),
          },
        }
      );
      return this.transform.templates(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch templates error.", error, { options });
    }
  }

  /**
   * Fetch single template by id.
   */
  async get(
    id: Template["id"],
    fields: string[] = ["examples"]
  ): Promise<Template> {
    try {
      const response = await this.axios.get<TemplateDTO>(`/templates/${id}`, {
        params: {
          ...this.transform.listParams(null, fields),
        },
      });
      return this.transform.template(response.data);
    } catch (error) {
      throw makeServerError("Fetch template error.", error, { id, fields });
    }
  }

  /**
   * Update template.
   */
  async update(template: Updates<Template>): Promise<Template> {
    try {
      const response = await this.axios.patch<TemplateDTO>(
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
   */
  async delete(template: Template | Template["id"]): Promise<void> {
    try {
      await this.axios.delete(`/templates/${getEntityId(template)}`);
    } catch (error) {
      throw makeServerError("Delete template error.", error, { id: template });
    }
  }

  private static completeRequest(
    options: ListOptions<TemplateFilters>
  ): ListRequest<TemplateFilters> {
    return Object.assign(
      {
        limit: 1000,
        offset: 0,
        fields: ["examples", "file_count"],
        filters: {},
      },
      options
    );
  }
}
