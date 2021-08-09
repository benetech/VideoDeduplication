import PropTypes from "prop-types";

export const ActionType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired,
});

export default ActionType;
