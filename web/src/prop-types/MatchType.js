import PropTypes from "prop-types";

/**
 * Prop-type for a match between two files.
 *
 * @typedef {{
 *   id: string|number,
 *   source: string|number,
 *   target: string|number,
 *   distance: number,
 *   falsePositive: boolean,
 * }} MatchType
 */
export const MatchType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  source: PropTypes.number.isRequired,
  target: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
  falsePositive: PropTypes.bool.isRequired,
});

export default MatchType;
