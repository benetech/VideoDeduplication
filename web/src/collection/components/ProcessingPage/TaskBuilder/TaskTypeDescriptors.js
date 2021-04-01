import React from "react";
import PropTypes from "prop-types";

const TaskTypeDescriptors = [
  {
    type: "ProcessDirectory",
    title: "task.type.directory",
    component: () => <div>TODO: Process Directory</div>,
  },
  {
    type: "MatchTemplates",
    title: "task.type.templates",
    component: () => <div>TODO: Match Templates</div>,
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
