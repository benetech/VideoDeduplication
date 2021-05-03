/**
 * Convert template file exclusion to axios request parameters.
 */
export default function templateFileExclusionFiltersToQueryParams({ filters }) {
  const params = {};
  if (filters?.templateId != null) {
    params.template_id = filters.templateId;
  }
  if (filters?.fileId != null) {
    params.file_id = filters.fileId;
  }
  return params;
}
