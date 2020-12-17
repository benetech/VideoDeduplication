import PropTypes from "prop-types";
import TaskStatus from "../state/tasks/TaskStatus";
import TaskRequest from "../state/tasks/TaskRequest";

export const TaskType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  submissionTime: PropTypes.instanceOf(Date).isRequired,
  statusUpdateTime: PropTypes.instanceOf(Date).isRequired,
  status: PropTypes.oneOf([
    TaskStatus.PENDING,
    TaskStatus.RUNNING,
    TaskStatus.SUCCESS,
    TaskStatus.FAILURE,
    TaskStatus.CANCELLED,
  ]).isRequired,
  request: PropTypes.shape({
    type: PropTypes.string.isRequired,
    directory: PropTypes.string,
    files: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  error: PropTypes.shape({
    type: PropTypes.string,
    module: PropTypes.string,
    message: PropTypes.string,
    traceback: PropTypes.string,
  }),
  progress: PropTypes.number,
});

export default TaskType;
