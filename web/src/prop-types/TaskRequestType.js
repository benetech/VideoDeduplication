import PropTypes from "prop-types";

/**
 * @typedef {{
 *   type: string,
 * }} TaskRequest
 */

/**
 * Prop-type for task request.
 */
const TaskRequestType = PropTypes.shape({
  type: PropTypes.string.isRequired,
});

export default TaskRequestType;
