import {
  ListOptions,
  ListRequest,
  ListResults,
  RepositoriesAPI,
} from "../../ServerAPI";
import { AxiosInstance } from "axios";
import FilesTransformer from "../transform/FilesTransformer";
import { Updates } from "../../../lib/entity/Entity";
import {
  Repository,
  RepositoryFilters,
  RepositoryPrototype,
} from "../../../model/VideoFile";
import { QueryResultsDTO } from "../dto/query";
import { makeServerError } from "../../ServerError";
import { CheckRepoCredentialsDTO, RepositoryDTO } from "../dto/files";
import getEntityId from "../../../lib/entity/getEntityId";

export default class RepositoryEndpoint implements RepositoriesAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: FilesTransformer;

  constructor(axios: AxiosInstance, transform?: FilesTransformer) {
    this.axios = axios;
    this.transform = transform || new FilesTransformer();
  }

  async create(repo: RepositoryPrototype): Promise<Repository> {
    try {
      const response = await this.axios.post<RepositoryDTO>(
        `/repositories/`,
        JSON.stringify(this.transform.createRepositoryDTO(repo)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.repository(response.data);
    } catch (error) {
      throw makeServerError("Create repository error.", error, { repo });
    }
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

  async get(id: Repository["id"]): Promise<Repository> {
    try {
      const response = await this.axios.get<RepositoryDTO>(
        `/repositories/${id}`
      );
      return this.transform.repository(response.data);
    } catch (error) {
      throw makeServerError("Get repository error", error, { id });
    }
  }

  async update(updates: Updates<Repository>): Promise<Repository> {
    try {
      const response = await this.axios.patch<RepositoryDTO>(
        `/repositories/${updates.id}`,
        JSON.stringify(this.transform.updateRepositoryDTO(updates)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.repository(response.data);
    } catch (error) {
      throw makeServerError("Update repository error", error, { updates });
    }
  }

  async delete(repo: Repository["id"] | Repository): Promise<void> {
    try {
      await this.axios.delete(`/repositories/${getEntityId(repo)}`);
    } catch (error) {
      throw makeServerError("Delete repository error.", error, { repo });
    }
  }

  async checkCredentials(repo: RepositoryPrototype): Promise<boolean> {
    try {
      const response = await this.axios.post<CheckRepoCredentialsDTO>(
        `/repositories/check`,
        JSON.stringify(this.transform.createRepositoryDTO(repo)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.confirm_credentials;
    } catch (error) {
      throw makeServerError("Check repository credentials error.", error, {
        repo,
      });
    }
  }

  async synchronize(
    repository: Updates<Repository> | Repository["id"]
  ): Promise<Repository> {
    try {
      const response = await this.axios.post<RepositoryDTO>(
        `/repositories/${getEntityId(repository)}/sync`
      );
      return this.transform.repository(response.data);
    } catch (error) {
      throw makeServerError("Synchronize repository error", error, {
        repository,
      });
    }
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
