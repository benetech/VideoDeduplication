import PropTypes from "prop-types";

const FrameMatchType = PropTypes.shape({
  fileId: PropTypes.number.isRequired,
  startMs: PropTypes.number.isRequired,
  endMs: PropTypes.number.isRequired,
});

export default FrameMatchType;
