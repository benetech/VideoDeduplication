import { FileMatch, Match } from "../../../model/Match";
import { MatchDTO, UpdateMatchDTO } from "../dto/matches";
import { Updates } from "../../../lib/entity/Entity";

/**
 * File API endpoint argument and result transformer.
 */
export default class MatchesTransformer {
  /**
   * Convert match DTO to match object.
   */
  match(match: MatchDTO): Match {
    return {
      id: match.id,
      distance: match.distance,
      source: match.source,
      target: match.target,
      falsePositive: match.false_positive,
    };
  }

  /**
   * Convert match to update-match DTO
   */
  updateDTO(match: Updates<FileMatch> | Updates<Match>): UpdateMatchDTO {
    return {
      false_positive: match.falsePositive,
    };
  }
}
