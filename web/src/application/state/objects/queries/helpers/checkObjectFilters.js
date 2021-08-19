/**
 * Check if the object satisfies query params.
 * @param {TemplateMatchFilters} params
 * @param {ObjectEntity} object
 * @return {boolean}
 */
export default function checkObjectFilters(params, object) {
  if (params.fileId != null && object.fileId !== params.fileId) {
    return false;
  }
  return !(
    params.templateId != null && object.templateId !== params.templateId
  );
}
