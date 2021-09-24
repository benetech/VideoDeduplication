import { AxiosInstance } from "axios";
import getEntityId from "../../../lib/entity/getEntityId";
import { makeServerError } from "../../ServerError";
import {
  ListOptions,
  ListRequest,
  ListResults,
  TemplateExclusionsAPI,
} from "../../ServerAPI";
import TemplateExclusionsTransformer from "../transform/TemplateExclusionsTransformer";
import {
  TemplateExclusion,
  TemplateExclusionFilters,
} from "../../../model/Template";
import { TemplateExclusionDTO } from "../dto/templates";
import { Transient } from "../../../lib/entity/Entity";
import { QueryResultsDTO } from "../dto/query";

/**
 * Client for template exclusions API endpoint.
 */
export default class TemplateExclusionsEndpoint
  implements TemplateExclusionsAPI
{
  private readonly axios: AxiosInstance;
  private readonly transform: TemplateExclusionsTransformer;

  constructor(axios: AxiosInstance, transform?: TemplateExclusionsTransformer) {
    this.axios = axios;
    this.transform = transform || new TemplateExclusionsTransformer();
  }

  /**
   * Create new template exclusion.
   */
  async create(
    exclusion: Transient<TemplateExclusion>
  ): Promise<TemplateExclusion> {
    try {
      const newExclusionDTO = this.transform.newExclusionDTO(exclusion);
      const response = await this.axios.post<TemplateExclusionDTO>(
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
   */
  async list(
    options: ListOptions<TemplateExclusionFilters> = {}
  ): Promise<ListResults<TemplateExclusion, TemplateExclusionFilters>> {
    try {
      const request = TemplateExclusionsEndpoint.completeRequest(options);
      const { limit, offset, filters } = request;
      const response = await this.axios.get<
        QueryResultsDTO<TemplateExclusionDTO>
      >("/template-file-exclusions/", {
        params: {
          limit,
          offset,
          ...this.transform.listParams(filters),
        },
      });
      return this.transform.exclusions(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch file exclusions error.", error, { options });
    }
  }

  /**
   * Get template-exclusion by id.
   */
  async get(id: TemplateExclusion["id"]): Promise<TemplateExclusion> {
    try {
      const response = await this.axios.get<TemplateExclusionDTO>(
        `/template-file-exclusions/${id}`
      );
      return this.transform.exclusion(response.data);
    } catch (error) {
      throw makeServerError("Fetch file exclusion error.", error, { id });
    }
  }

  /**
   * Delete template exclusion.
   */
  async delete(
    exclusion: TemplateExclusion | TemplateExclusion["id"]
  ): Promise<void> {
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

  private static completeRequest(
    options: ListOptions<TemplateExclusionFilters>
  ): ListRequest<TemplateExclusionFilters> {
    return Object.assign(
      {
        limit: 1000,
        offset: 0,
        filters: {},
        fields: [],
      },
      options
    );
  }
}
