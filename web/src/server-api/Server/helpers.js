export function filtersToQueryParams(filters) {
  const params = {};
  if (filters.query) {
    params.query = filters.query;
  }
  return params;
}
