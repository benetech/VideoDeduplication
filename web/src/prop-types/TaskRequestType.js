import PropTypes from "prop-types";

/**
 * Prop-type for task request.
 *
 * @typedef {{
 *   type: string,
 * }} TaskRequestType
 */
const TaskRequestType = PropTypes.shape({
  type: PropTypes.string.isRequired,
});

export default TaskRequestType;
