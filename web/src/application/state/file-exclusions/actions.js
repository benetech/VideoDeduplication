export const ACTION_CREATE_TEMPLATE_FILE_EXCLUSION =
  "coll.CREATE_TEMPLATE_FILE_EXCLUSION";

export function createTemplateFileExclusion(exclusion) {
  return { type: ACTION_CREATE_TEMPLATE_FILE_EXCLUSION, exclusion };
}

export const ACTION_DELETE_TEMPLATE_FILE_EXCLUSION =
  "coll.DELETE_TEMPLATE_FILE_EXCLUSION";

export function deleteTemplateFileExclusion(exclusion) {
  return { type: ACTION_DELETE_TEMPLATE_FILE_EXCLUSION, exclusion };
}

export const ACTION_CACHE_TEMPLATE_FILE_EXCLUSIONS =
  "coll.CACHE_TEMPLATE_FILE_EXCLUSIONS";

export function cacheTemplateFileExclusions(fileId, exclusions) {
  return { type: ACTION_CACHE_TEMPLATE_FILE_EXCLUSIONS, fileId, exclusions };
}
