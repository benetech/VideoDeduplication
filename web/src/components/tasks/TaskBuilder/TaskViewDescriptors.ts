import { TaskRequestType } from "../../../model/Task";
import { TaskViewDescriptor } from "./model";

const TaskViewDescriptors: TaskViewDescriptor[] = [
  {
    type: TaskRequestType.DIRECTORY,
    title: "task.type.directory",
  },
  {
    type: TaskRequestType.MATCH_TEMPLATES,
    title: "task.type.templates",
  },
  {
    type: TaskRequestType.PROCESS_ONLINE_VIDEO,
    title: "task.type.processOnline",
  },
];

export default TaskViewDescriptors;
