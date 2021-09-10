import PropTypes from "prop-types";
import IconKind from "../application/state/templates/IconKind";

/**
 * @typedef {{
 *   kind: string,
 *   key: string
 * }} TemplateIcon
 */

/**
 * Template icon prop-type.
 */
export const TemplateIconType = PropTypes.shape({
  kind: PropTypes.oneOf([IconKind.PREDEFINED, IconKind.CUSTOM]).isRequired,
  key: PropTypes.string.isRequired,
});

/**
 * @typedef {{
 *   id: string|number,
 *   url: string,
 *   templateId: string|number,
 * }} TemplateExampleEntity
 */

/**
 * Template example prop-type.
 *
 * Template example is an image associate with a template which visually
 * exemplifies some object or situation represented by the template.
 */
export const TemplateExampleType = PropTypes.shape({
  id: PropTypes.any.isRequired,
  url: PropTypes.string.isRequired,
  templateId: PropTypes.any.isRequired,
});

/**
 * @typedef {{
 *   id: string|number,
 *   name: string,
 *   icon: TemplateIcon,
 *   examples: TemplateExampleEntity[],
 *   fileCount: number|undefined,
 * }} TemplateEntity
 */

/**
 * Prop type for template.
 *
 * Template is collection of example-images which visually represents some
 * object or situation which the application will be able to find in the
 * existing files.
 */
export const TemplateType = PropTypes.shape({
  id: PropTypes.any,
  name: PropTypes.string.isRequired,
  icon: TemplateIconType,
  examples: PropTypes.arrayOf(TemplateExampleType).isRequired,
  fileCount: PropTypes.number,
});
