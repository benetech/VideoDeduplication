import PropTypes from "prop-types";
import FileType from "./FileType";
import { TemplateType } from "./TemplateType";

/**
 * @typedef {{
 *   id: string|number,
 *   file: FileEntity,
 *   template: TemplateEntity,
 * }} TemplateExclusionEntity
 */

/**
 * Prop-type for a black-listed (file, template) pair.
 */
const TemplateExclusionType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  file: FileType.isRequired,
  template: TemplateType.isRequired,
});

export default TemplateExclusionType;
