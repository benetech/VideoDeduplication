import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/react-query/useEntitiesLazy";

/**
 * Use lazy filter-presets query.
 * @param {PresetFilters} filters query filters
 * @param {{
 *   limit: number,
 * }} options additional options
 * @return {InfiniteQueryAPI} files query.
 */
export default function usePresetsLazy(filters, options = {}) {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy(
    ["presets", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.presets.list({ filters, limit, offset })
  );

  return results;
}
