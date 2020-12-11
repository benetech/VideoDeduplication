import PropTypes from "prop-types";
import TaskStatus from "../state/tasks/TaskStatus";

export const TaskType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  submissionTime: PropTypes.instanceOf(Date).isRequired,
  lastUpdateTime: PropTypes.instanceOf(Date).isRequired,
  status: PropTypes.oneOf([
    TaskStatus.PENDING,
    TaskStatus.RUNNING,
    TaskStatus.SUCCESS,
    TaskStatus.FAILURE,
    TaskStatus.CANCELLED,
  ]).isRequired,
  progress: PropTypes.number,
});

export default TaskType;
