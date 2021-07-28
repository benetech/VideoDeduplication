import PropTypes from "prop-types";
import FileType from "./FileType";
import { TemplateType } from "./TemplateType";

/**
 * Prop-type for a black-listed (file, template) pair.
 */
const FileExclusionType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  file: FileType.isRequired,
  template: TemplateType.isRequired,
});

export default FileExclusionType;
