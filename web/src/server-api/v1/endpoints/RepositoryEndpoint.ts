import {
  ListOptions,
  ListRequest,
  ListResults,
  RepositoriesAPI,
} from "../../ServerAPI";
import { AxiosInstance } from "axios";
import FilesTransformer from "../transform/FilesTransformer";
import { Transient, Updates } from "../../../lib/entity/Entity";
import { Repository, RepositoryFilters } from "../../../model/VideoFile";
import { QueryResultsDTO } from "../dto/query";
import { makeServerError } from "../../ServerError";
import { RepositoryDTO } from "../dto/files";

export default class RepositoryEndpoint implements RepositoriesAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: FilesTransformer;

  constructor(axios: AxiosInstance, transform?: FilesTransformer) {
    this.axios = axios;
    this.transform = transform || new FilesTransformer();
  }

  async create(entity: Transient<Repository>): Promise<Repository> {
    return Promise.resolve(undefined);
  }

  async list(
    options: ListOptions<RepositoryFilters>
  ): Promise<ListResults<Repository, RepositoryFilters>> {
    try {
      const request = RepositoryEndpoint.completeRequest(options);
      const { limit, offset, filters } = request;
      const response = await this.axios.get<QueryResultsDTO<RepositoryDTO>>(
        `/repositories/`,
        {
          params: {
            limit,
            offset,
            ...this.transform.repositoriesParams(filters),
          },
        }
      );
      return this.transform.repositories(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch repositories error.", error, { options });
    }
  }

  async get(id: Repository["id"], fields?: string[]): Promise<Repository> {
    return Promise.resolve(undefined);
  }

  async update(entity: Updates<Repository>): Promise<Repository> {
    return Promise.resolve(undefined);
  }

  async delete(entity: Repository["id"] | Repository): Promise<void> {
    return Promise.resolve(undefined);
  }

  private static completeRequest(
    options: ListOptions<RepositoryFilters>
  ): ListRequest<RepositoryFilters> {
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
