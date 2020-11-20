/**
 * Convert file match filters to axios request parameters.
 */
export default function matchesFiltersToQueryParams({ fields }) {
  const params = {};
  if (fields != null && fields.length > 0) {
    params.include = fields.join(",");
  }
  return params;
}
