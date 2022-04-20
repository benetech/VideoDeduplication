import { EmbeddingsAPI, NeighborsRequest } from "../../ServerAPI";
import { AxiosInstance } from "axios";
import {
  EmbeddingAlgorithm,
  EmbeddingNeighbor,
  TilesInfo,
} from "../../../model/embeddings";
import EmbeddingsTransformer from "../transform/EmbeddingsTransformer";
import { makeServerError } from "../../ServerError";
import { EmbeddingNeighborDTO, TilesInfoDTO } from "../dto/embeddings";

export default class EmbeddingsEndpoint implements EmbeddingsAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: EmbeddingsTransformer;

  constructor(axios: AxiosInstance, transform?: EmbeddingsTransformer) {
    this.axios = axios;
    this.transform = transform || new EmbeddingsTransformer();
  }

  async getTileInfo(algorithm: EmbeddingAlgorithm): Promise<TilesInfo> {
    try {
      const response = await this.axios.get<TilesInfoDTO>(
        `/embeddings/${algorithm}/tiles/info`
      );
      return this.transform.tilesInfo(response.data);
    } catch (error) {
      throw makeServerError("Fetch tiles info error.", error);
    }
  }

  async getNeighbors(request: NeighborsRequest): Promise<EmbeddingNeighbor[]> {
    try {
      const response = await this.axios.get<EmbeddingNeighborDTO[]>(
        `/embeddings/${request.algorithm}/neighbors`,
        {
          params: this.transform.neighborsParams(request),
        }
      );
      return this.transform.neighbors(response.data);
    } catch (error) {
      throw makeServerError("Fetch neighbors error.", error, { request });
    }
  }
}
