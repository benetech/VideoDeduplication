import StatsTransformer from "../transform/StatsTransformer";
import { makeServerError } from "../../ServerError";
import { AxiosInstance } from "axios";
import { StatsAPI } from "../../ServerAPI";
import { ExtensionsStats } from "../../../model/Stats";
import { ExtensionsDTO } from "../dto/stats";

/**
 * Client for statistics API endpoint.
 */

export default class StatsEndpoint implements StatsAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: StatsTransformer;

  constructor(axios: AxiosInstance, transform?: StatsTransformer) {
    this.axios = axios;
    this.transform = transform || new StatsTransformer();
  }

  async extensions(): Promise<ExtensionsStats> {
    try {
      const response = await this.axios.get<ExtensionsDTO>("/stats/extensions");
      return this.transform.extensions(response.data);
    } catch (error) {
      throw makeServerError("Fetch extensions error.", error);
    }
  }
}
