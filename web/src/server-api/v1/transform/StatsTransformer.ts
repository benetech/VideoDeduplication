import { ExtensionsStats } from "../../../model/Stats";
import { ExtensionsDTO } from "../dto/stats";

/**
 * Statistics API request & response transformer.
 */
export default class StatsTransformer {
  extensions(data: ExtensionsDTO): ExtensionsStats {
    return data; // No difference
  }
}
