import React from "react";

const TaskTypes = [
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

export default TaskTypes;
