import PropTypes from "prop-types";

const ProcessedFileType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
});

export default ProcessedFileType;
