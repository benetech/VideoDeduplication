/**
 * Convert preset filters to axios request parameters.
 */
export default function presetFiltersToQueryParams({ filters }) {
  const params = {};
  if (filters?.name != null) {
    params.name = filters.name;
  }
  return params;
}
