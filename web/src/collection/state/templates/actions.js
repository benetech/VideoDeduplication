export const ACTION_ADD_TEMPlATES = "coll.ADD_TEMPlATES";

export function addTemPlAtes(templates) {
  return { type: ACTION_ADD_TEMPlATES, templates };
}

export const ACTION_SET_TEMPLATES = "coll.SET_TEMPLATES";

export function setTemplates(templates) {
  return { type: ACTION_SET_TEMPLATES, templates };
}

export const ACTION_UPDATE_TEMPLATE = "coll.UPDATE_TEMPLATE";

export function updateTemplate(template) {
  return { type: ACTION_UPDATE_TEMPLATE, template };
}

export const ACTION_DELETE_TEMPLATE = "coll.DELETE_TEMPLATE";

export function deleteTemplate(id) {
  return { type: ACTION_DELETE_TEMPLATE, id };
}

export const ACTION_ADD_EXAMPLE = "coll.ADD_EXAMPLE";

export function addExample(example) {
  return { type: ACTION_ADD_EXAMPLE, example };
}

export const ACTION_DELETE_EXAMPLE = "coll.DELETE_EXAMPLE";

export function deleteExample(id) {
  return { type: ACTION_DELETE_EXAMPLE, id };
}
