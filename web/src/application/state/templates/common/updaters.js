import extendEntityList from "../../../common/helpers/extendEntityList";
import deleteEntityFromList from "../../../common/helpers/deleteEntityFromList";

/**
 * Add example to template.
 * @param {TemplateType} template
 * @param {TemplateExampleType} example
 * @return {TemplateType}
 */
export function addExample(template, example) {
  return {
    ...template,
    examples: extendEntityList(template.examples, [example]),
  };
}

/**
 * Delete example from the template.
 * @param {TemplateType} template
 * @param {TemplateExampleType} example
 * @return {TemplateType}
 */
export function delExample(template, example) {
  return {
    ...template,
    examples: deleteEntityFromList(template.examples, example),
  };
}
