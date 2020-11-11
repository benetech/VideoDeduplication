/**
 * Convert file filters to axios request params.
 */
export default function clusterFiltersToQueryParams({ filters, fields }) {
  const params = {};
  if (filters?.hops != null) {
    params.hops = filters.hops;
  }
  if (filters?.minDistance != null) {
    params.min_distance = filters.minDistance;
  }
  if (filters?.maxDistance != null) {
    params.max_distance = filters.maxDistance;
  }
  if (fields != null && fields.length > 0) {
    params.include = fields.join(",");
  }
  return params;
}
