import PropTypes from "prop-types";
import FileType from "./FileType";

/**
 * Prop-type for a match in the context of the given mother file.
 *
 * @typedef {{
 *   id: string|number,
 *   motherFile: FileType|null,
 *   file: FileType,
 *   distance: number,
 *   falsePositive: boolean,
 * }} FileMatchType
 */
const FileMatchType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  motherFile: FileType.isRequired,
  file: FileType.isRequired,
  distance: PropTypes.number.isRequired,
  falsePositive: PropTypes.bool.isRequired,
});

export default FileMatchType;
