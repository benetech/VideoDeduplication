import PropTypes from "prop-types";
import TaskRequest from "../../../state/tasks/TaskRequest";
import MatchTemplatesForm from "./forms/MatchTemplatesForm";
import ProcessDirectoryForm from "./forms/ProcessDirectoryForm";
import ProcessOnlineVideoForm from "./forms/ProcessOnlineVideoForm";

const TaskTypeDescriptors = [
  {
    type: TaskRequest.DIRECTORY,
    title: "task.type.directory",
    component: ProcessDirectoryForm,
  },
  {
    type: TaskRequest.MATCH_TEMPLATES,
    title: "task.type.templates",
    component: MatchTemplatesForm,
  },
  {
    type: TaskRequest.PROCESS_ONLINE_VIDEO,
    title: "task.type.processOnline",
    component: ProcessOnlineVideoForm,
  },
];

/**
 * Prop-Type for task type descriptor.
 */
export const TaskTypeDescriptorType = PropTypes.shape({
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  component: PropTypes.elementType.isRequired,
});

export default TaskTypeDescriptors;
