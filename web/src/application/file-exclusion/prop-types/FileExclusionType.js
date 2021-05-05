import PropTypes from "prop-types";
import FileType from "../../../collection/prop-types/FileType";
import { TemplateType } from "../../../collection/prop-types/TemplateType";

/**
 * Prop-type for a black-listed (file, template) pair.
 */
const FileExclusionType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  file: FileType.isRequired,
  template: TemplateType.isRequired,
});

export default FileExclusionType;
