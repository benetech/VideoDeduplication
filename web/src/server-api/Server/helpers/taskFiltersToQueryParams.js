/**
 * Convert task filters to axios request parameters.
 */
export default function taskFiltersToQueryParams({ status }) {
  const params = {};
  if (status != null && status.length > 0) {
    params.status = status.join(",");
  }
  return params;
}
