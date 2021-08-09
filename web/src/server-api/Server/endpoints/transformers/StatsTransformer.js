import Statistics from "../../../../application/api/stats/Statistics";

/**
 * Statistics API request & response transformer.
 */
export default class StatsTransformer {
  constructor() {}

  /**
   * Transform application statistics.
   * @param {string} name statistics name
   * @param {*} data server response
   * @return {*} formatted statistics
   */
  stats(name, data) {
    switch (name) {
      case Statistics.extensions: {
        // No transformation required so far.
        const extensions = data.extensions;
        return extensions.map((extension) => extension.toUpperCase());
      }
      default:
        console.warn(`Don't know how to transform statistics '${name}'`);
        return data;
    }
  }
}
