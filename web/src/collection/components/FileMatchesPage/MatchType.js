import PropTypes from "prop-types";

/**
 * Prop-type for a match between two files.
 */
export const MatchType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  source: PropTypes.number.isRequired,
  target: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
});

export default MatchType;
