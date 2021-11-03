import { AxiosInstance } from "axios";
import FilesTransformer from "../transform/FilesTransformer";
import { makeServerError } from "../../ServerError";
import {
  FilesAPI,
  ListFilesResults,
  ListOptions,
  ListRequest,
  QueryClusterOptions,
  QueryClusterRequest,
  QueryClusterResults,
  QueryFileMatchesOptions,
  QueryFileMatchesRequest,
  QueryFileMatchesResults,
} from "../../ServerAPI";
import {
  DefaultFilters,
  FileFilters,
  VideoFile,
} from "../../../model/VideoFile";

/**
 * Client for file API endpoint.
 */
export default class FilesEndpoint implements FilesAPI {
  private readonly transform: FilesTransformer;
  private readonly axios: AxiosInstance;

  constructor(axios: AxiosInstance, transform?: FilesTransformer) {
    this.axios = axios;
    this.transform = transform || new FilesTransformer();
  }

  /**
   * Get file list.
   */
  async list(
    options: ListOptions<FileFilters> = {}
  ): Promise<ListFilesResults> {
    try {
      const request = FilesEndpoint.filesRequest(options);
      const { limit, offset, filters, fields } = request;
      const response = await this.axios.get("/files/", {
        params: {
          offset,
          limit,
          include: fields.join(","),
          ...this.transform.listParams(filters),
        },
      });
      return this.transform.files(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch files error.", error, { options });
    }
  }

  /**
   * Get single file by id.
   */
  async get(id: number): Promise<VideoFile> {
    try {
      const response = await this.axios.get(`/files/${id}`, {
        params: {
          include: ["signature", "meta", "scenes", "exif"].join(","),
        },
      });
      return this.transform.file(response.data);
    } catch (error) {
      throw makeServerError("Fetch file error.", error, { id });
    }
  }

  /**
   * Query file's neighbors.
   */
  async cluster(options: QueryClusterOptions): Promise<QueryClusterResults> {
    try {
      const request = FilesEndpoint.clusterRequest(options);
      const { fileId, limit, offset, fields, filters } = request;
      const response = await this.axios.get(`/files/${fileId}/cluster`, {
        params: {
          limit,
          offset,
          ...this.transform.clusterParams(filters, fields),
        },
      });

      return this.transform.cluster(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch file cluster error.", error, { options });
    }
  }

  /**
   * List file matches.
   */
  async matches(
    options: QueryFileMatchesOptions
  ): Promise<QueryFileMatchesResults> {
    try {
      const request = FilesEndpoint.matchesRequest(options);
      const { fileId, limit, offset, fields, filters } = request;
      const response = await this.axios.get(`/files/${fileId}/matches`, {
        params: {
          limit,
          offset,
          ...this.transform.matchesParams(filters, fields),
        },
      });
      return this.transform.matches(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch file matches error.", error, { options });
    }
  }

  /**
   * Check if video file is available for watching.
   */
  async probeVideo(id: number): Promise<void> {
    try {
      await this.axios.head(`/files/${id}/watch`);
    } catch (error) {
      throw makeServerError("Probe video error.", error, { id });
    }
  }

  private static filesRequest(
    options: ListOptions<FileFilters>
  ): ListRequest<FileFilters> {
    return Object.assign(
      {
        limit: 100,
        offset: 0,
        fields: [
          "signature",
          "meta",
          "exif",
          "duplicates",
          "related",
          "templates",
        ],
        filters: DefaultFilters,
      },
      options
    );
  }

  private static clusterRequest(
    options: QueryClusterOptions
  ): QueryClusterRequest {
    return Object.assign(
      {
        limit: 20,
        offset: 0,
        fields: [],
        filters: {},
      },
      options
    );
  }

  private static matchesRequest(
    options: QueryFileMatchesOptions
  ): QueryFileMatchesRequest {
    return Object.assign(
      {
        limit: 20,
        offset: 0,
        fields: ["meta", "exif", "scenes"],
        filters: {
          remote: false,
        },
      },
      options
    );
  }
}
