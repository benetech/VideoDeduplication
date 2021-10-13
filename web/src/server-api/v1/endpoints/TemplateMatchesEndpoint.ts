import getEntityId from "../../../lib/entity/getEntityId";
import TemplatesTransformer from "../transform/TemplatesTransformer";
import { makeServerError } from "../../ServerError";
import {
  ListOptions,
  ListRequest,
  ListTemplateMatchesResults,
  TemplateMatchesAPI,
} from "../../ServerAPI";
import { AxiosInstance } from "axios";
import { TemplateMatch, TemplateMatchFilters } from "../../../model/Template";
import { TemplateMatchQueryResultsDTO } from "../dto/templates";
import { Updates } from "../../../lib/entity/Entity";

export default class TemplateMatchesEndpoint implements TemplateMatchesAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: TemplatesTransformer;

  constructor(axios: AxiosInstance, transform?: TemplatesTransformer) {
    this.axios = axios;
    this.transform = transform || new TemplatesTransformer();
  }

  /**
   * List template matches;
   */
  async list(
    options: ListOptions<TemplateMatchFilters> = {}
  ): Promise<ListTemplateMatchesResults> {
    const request = TemplateMatchesEndpoint.completeRequest(options);
    const { limit, offset, fields, filters } = request;

    try {
      const response = await this.axios.get<TemplateMatchQueryResultsDTO>(
        `/template_matches/`,
        {
          params: {
            limit,
            offset,
            ...this.transform.matchesParams(filters, fields),
          },
        }
      );
      return this.transform.matches(response.data, request);
    } catch (error) {
      throw makeServerError("Get template-matches error.", error, options);
    }
  }

  /**
   * Get template match by id.
   */
  async get(
    id: TemplateMatch["id"],
    fields: string[] = ["template", "file"]
  ): Promise<TemplateMatch> {
    try {
      const response = await this.axios.get(`/template_matches/${id}`, {
        params: {
          ...this.transform.matchesParams(null, fields),
        },
      });
      return this.transform.match(response.data);
    } catch (error) {
      throw makeServerError("Get template-match error.", error, {
        id,
        fields,
      });
    }
  }

  /**
   * Update template match.
   */
  async update(match: Updates<TemplateMatch>): Promise<TemplateMatch> {
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
   */
  async delete(match: TemplateMatch | TemplateMatch["id"]): Promise<void> {
    try {
      await this.axios.delete(`/template_matches/${getEntityId(match)}`);
    } catch (error) {
      throw makeServerError("Delete object error.", error, { match });
    }
  }

  private static completeRequest(
    options: ListOptions<TemplateMatchFilters>
  ): ListRequest<TemplateMatchFilters> {
    return Object.assign(
      {
        limit: 1000,
        offset: 0,
        fields: ["template", "file"],
        filters: {},
      },
      options
    );
  }
}
