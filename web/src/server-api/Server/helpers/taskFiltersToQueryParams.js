/**
 * Convert task filters to axios request parameters.
 */
export default function taskFiltersToQueryParams({ status }) {
  const params = {};
  if (status != null && fields.length > 0) {
    params.status = fields.join(",");
  }
  return params;
}
