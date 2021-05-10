/**
 * Convert template time exclusion to axios request parameters.
 */
export default function templateTimeExclusionFiltersToQueryParams({ filters }) {
  const params = {};
  if (filters?.templateId != null) {
    params.template_id = filters.templateId;
  }
  if (filters?.fileId != null) {
    params.file_id = filters.fileId;
  }
  if (filters?.minStart != null) {
    params.min_start = filters.minStart;
  }
  if (filters?.maxStart != null) {
    params.max_start = filters.maxStart;
  }
  if (filters?.minEnd != null) {
    params.min_end = filters.minENd;
  }
  if (filters?.maxEnd != null) {
    params.max_end = filters.maxEnd;
  }
  return params;
}
