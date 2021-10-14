import { makeServerError } from "../../ServerError";
import MatchesTransformer from "../transform/MatchesTransformer";
import { AxiosInstance } from "axios";
import { MatchesAPI } from "../../ServerAPI";
import { Updates } from "../../../lib/entity/Entity";
import { FileMatch, Match } from "../../../model/Match";

/**
 * Client for matches API endpoint.
 */
export default class MatchesEndpoint implements MatchesAPI {
  private readonly transform: MatchesTransformer;
  private readonly axios: AxiosInstance;

  constructor(axios: AxiosInstance, transform?: MatchesTransformer) {
    this.axios = axios;
    this.transform = transform || new MatchesTransformer();
  }

  /**
   * Update match.
   */
  async update(match: Updates<FileMatch> | Updates<Match>): Promise<Match> {
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
