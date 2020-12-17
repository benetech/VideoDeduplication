import PropTypes from "prop-types";
import TaskStatus from "../state/tasks/TaskStatus";
import TaskRequest from "../state/tasks/TaskRequest";

export const TaskType = PropTypes.shape({
  id: PropTypes.number.isRequired,
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
    type: PropTypes.oneOf([TaskRequest.DIRECTORY, TaskRequest.FILE_LIST])
      .isRequired,
    directoryPath: PropTypes.string,
    files: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  progress: PropTypes.number,
});

export default TaskType;
