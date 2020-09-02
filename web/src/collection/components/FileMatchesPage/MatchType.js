import PropTypes from "prop-types";
import FileType from "../FileBrowserPage/FileType";

/**
 * Prop-type for a match between two files.
 */
export const MatchType = PropTypes.shape({
  source: FileType.isRequired,
  file: FileType.isRequired,
  distance: PropTypes.number.isRequired,
});

export default MatchType;
