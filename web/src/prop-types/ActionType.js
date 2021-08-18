import PropTypes from "prop-types";

/**
 * Named executable action (e.g. in context menu).
 */
export const ActionType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired,
});

export default ActionType;
