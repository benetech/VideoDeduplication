/**
 * Convert template match filters to axios request parameters.
 */
export default function templateMatchFiltersToQueryParams({ fields, filters }) {
  const params = {};
  if (fields != null && fields.length > 0) {
    params.include = fields.join(",");
  }
  if (filters?.templateId != null) {
    params.template_id = filters.templateId;
  }
  if (filters?.fileId != null) {
    params.file_id = filters.fileId;
  }
  return params;
}
