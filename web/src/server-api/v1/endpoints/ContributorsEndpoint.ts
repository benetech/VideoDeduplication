import {
  ContributorsAPI,
  ListOptions,
  ListRequest,
  ListResults,
} from "../../ServerAPI";
import { AxiosInstance } from "axios";
import FilesTransformer from "../transform/FilesTransformer";
import { Contributor, ContributorFilters } from "../../../model/VideoFile";
import { makeServerError } from "../../ServerError";
import { ContributorDTO } from "../dto/files";
import { QueryResultsDTO } from "../dto/query";

export default class ContributorsEndpoint implements ContributorsAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: FilesTransformer;

  constructor(axios: AxiosInstance, transform?: FilesTransformer) {
    this.axios = axios;
    this.transform = transform || new FilesTransformer();
  }

  async list(
    options: ListOptions<ContributorFilters>
  ): Promise<ListResults<Contributor, ContributorFilters>> {
    try {
      const request = ContributorsEndpoint.completeRequest(options);
      const { limit, offset, filters } = request;
      const response = await this.axios.get<QueryResultsDTO<ContributorDTO>>(
        `/contributors/`,
        {
          params: {
            limit,
            offset,
            ...this.transform.contributorsParams(filters),
          },
        }
      );
      return this.transform.contributors(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch repositories error.", error, { options });
    }
  }

  async get(id: Contributor["id"]): Promise<Contributor> {
    try {
      const response = await this.axios.get<ContributorDTO>(
        `/contributors/${id}`
      );
      return this.transform.contributor(response.data);
    } catch (error) {
      throw makeServerError("Get contributor error", error, { id });
    }
  }

  private static completeRequest(
    options: ListOptions<ContributorFilters>
  ): ListRequest<ContributorFilters> {
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
