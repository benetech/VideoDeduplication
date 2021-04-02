import React from "react";
import PropTypes from "prop-types";
import MatchTemplatesForm from "./MatchTemplatesForm";
import ProcessDirectoryForm from "./ProcessDirectoryForm";
import TaskRequest from "../../../state/tasks/TaskRequest";

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
