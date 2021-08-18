import PropTypes from "prop-types";
import FileType from "./FileType";

/**
 * @typedef {{
 *   id: string|number,
 *   motherFile: FileEntity|null,
 *   file: FileEntity,
 *   distance: number,
 *   falsePositive: boolean,
 * }} FileMatchEntity
 */

/**
 * Prop-type for a match in the context of the given mother file.
 */
const FileMatchType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  motherFile: FileType.isRequired,
  file: FileType.isRequired,
  distance: PropTypes.number.isRequired,
  falsePositive: PropTypes.bool.isRequired,
});

export default FileMatchType;
