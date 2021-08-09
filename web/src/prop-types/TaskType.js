import PropTypes from "prop-types";
import TaskStatus from "../application/state/tasks/TaskStatus";
import TaskRequestType from "./TaskRequestType";

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
  request: TaskRequestType.isRequired,
  error: PropTypes.shape({
    type: PropTypes.string,
    module: PropTypes.string,
    message: PropTypes.string,
    traceback: PropTypes.string,
  }),
  progress: PropTypes.number,
  raw: PropTypes.object,
});

export default TaskType;
