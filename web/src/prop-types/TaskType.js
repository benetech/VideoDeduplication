import PropTypes from "prop-types";
import TaskStatus from "./TaskStatus";
import TaskRequestType from "./TaskRequestType";

/**
 * Prop-type for background task.
 *
 * @typedef {{
 *   id: string|number,
 *   submissionTime: Date,
 *   statusUpdateTime: Date,
 *   status: string,
 *   request: TaskRequestTypes,
 *   error: {type: string, module:string, message: string, traceback: string}|undefined,
 *   progress: number|undefined,
 *   raw: Object,
 * }} TaskEntity
 */
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
