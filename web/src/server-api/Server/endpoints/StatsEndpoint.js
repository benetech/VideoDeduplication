/**
 * Client for statistics API endpoint.
 */
import StatsTransformer from "./transformers/StatsTransformer";
import { makeServerError } from "../ServerError";

export default class StatsEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new StatsTransformer();
  }

  /**
   * Get predefined application statistics by name.
   *
   * Available statistics names:
   *  - `extensions` - list of the existing file extensions.
   *
   * @param {{
   *   name: string,
   * }} options statistics name.
   */
  async get(options = {}) {
    try {
      const { name } = options;
      const response = await this.axios.get(`/stats/${name}`);
      return this.transform.stats(name, response.data);
    } catch (error) {
      throw makeServerError("Fetch statistics error.", error, { options });
    }
  }
}
