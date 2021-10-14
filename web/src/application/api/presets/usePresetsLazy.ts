import { useServer } from "../../../server-api/context";
import useEntitiesLazy from "../../common/useEntitiesLazy";
import { LazyQueryResults, QueryOptions } from "../../common/model";
import { Preset, PresetFilters } from "../../../model/Preset";

/**
 * Use lazy filter-presets query.
 */
export default function usePresetsLazy(
  filters: PresetFilters = {},
  options: QueryOptions = {}
): LazyQueryResults<Preset[]> {
  const server = useServer();
  const { limit = 100 } = options;

  const { results } = useEntitiesLazy<Preset, PresetFilters>(
    ["presets", filters, limit],
    ({ pageParam: offset = 0 }) =>
      server.presets.list({ filters, limit, offset })
  );

  return results;
}
