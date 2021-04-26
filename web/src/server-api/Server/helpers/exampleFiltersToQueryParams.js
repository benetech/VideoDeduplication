/**
 * Convert example filters to axios request parameters.
 */
export default function exampleFiltersToQueryParams({ fields, filters }) {
  const params = {};
  if (fields != null && fields.length > 0) {
    params.include = fields.join(",");
  }
  if (filters?.templateId != null) {
    params.template_id = filters.templateId;
  }
  return params;
}
