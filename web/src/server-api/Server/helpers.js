export function filtersToQueryParams(filters) {
  const params = {};
  if (filters.query) {
    params.query = filters.query;
  }
  if (filters.extensions && filters.extensions.length > 0) {
    const extensions = filters.extensions
      .map((ext) => ext.trim())
      .filter((ext) => ext.length > 0);
    if (extensions.length > 0) {
      params.extensions = extensions.join(",");
    }
  }
  return params;
}
