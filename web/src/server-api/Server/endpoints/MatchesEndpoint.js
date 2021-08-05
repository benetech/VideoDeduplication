import { makeServerError } from "../ServerError";
import MatchesTransformer from "./MatchesTransformer";

/**
 * Client for matches API endpoint.
 */
export default class MatchesEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new MatchesTransformer();
  }

  /**
   * Update match.
   * @param match match object with updated attributes.
   * @return {Promise<Match>}
   */
  async update(match) {
    try {
      const response = await this.axios.patch(
        `/matches/${match.id}`,
        JSON.stringify(this.transform.updateDTO(match)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.match(response.data);
    } catch (error) {
      throw makeServerError("Update match error.", error, { match });
    }
  }
}
