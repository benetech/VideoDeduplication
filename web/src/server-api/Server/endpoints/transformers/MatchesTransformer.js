/**
 * File API endpoint argument and result transformer.
 */
export default class MatchesTransformer {
  constructor() {}

  /**
   * Convert match DTO to match object.
   * @param match match DTO
   * @return {MatchType}
   */
  match(match) {
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
   * @param match match object
   * @return {{false_positive}}
   */
  updateDTO(match) {
    return {
      false_positive: match.falsePositive,
    };
  }
}
