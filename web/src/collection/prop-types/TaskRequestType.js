import PropTypes from "prop-types";

const TaskRequestType = PropTypes.shape({
  type: PropTypes.string.isRequired,
});

export default TaskRequestType;
