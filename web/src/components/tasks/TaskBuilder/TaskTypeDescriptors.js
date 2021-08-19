import PropTypes from "prop-types";
import TaskRequestTypes from "../../../prop-types/TaskRequestTypes";
import MatchTemplatesForm from "./forms/MatchTemplatesForm";
import ProcessDirectoryForm from "./forms/ProcessDirectoryForm";
import ProcessOnlineVideoForm from "./forms/ProcessOnlineVideoForm";

const TaskTypeDescriptors = [
  {
    type: TaskRequestTypes.DIRECTORY,
    title: "task.type.directory",
    component: ProcessDirectoryForm,
  },
  {
    type: TaskRequestTypes.MATCH_TEMPLATES,
    title: "task.type.templates",
    component: MatchTemplatesForm,
  },
  {
    type: TaskRequestTypes.PROCESS_ONLINE_VIDEO,
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
