/**
 * Convert file match filters to axios request parameters.
 */
export default function matchesFiltersToQueryParams({ fields, filters }) {
  const params = {};
  if (fields != null && fields.length > 0) {
    params.include = fields.join(",");
  }
  if (filters?.remote != null) {
    params.remote = !!filters.remote;
  }
  if (filters?.falsePositive != null) {
    params.false_positive = !!filters.falsePositive;
  }
  if (filters?.sort != null) {
    params.sort = filters.sort;
  }
  if (filters?.sortDirection != null) {
    params.sort_direction = filters.sortDirection;
  }
  return params;
}
