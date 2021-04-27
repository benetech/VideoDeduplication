import PropTypes from "prop-types";
import FileType from "../../../collection/prop-types/FileType";

/**
 * Prop-type for a match in the context of the given mother file.
 */
const FileMatchType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  motherFileId: PropTypes.number.isRequired,
  file: FileType.isRequired,
  distance: PropTypes.number.isRequired,
  falsePositive: PropTypes.bool.isRequired,
});

export default FileMatchType;
