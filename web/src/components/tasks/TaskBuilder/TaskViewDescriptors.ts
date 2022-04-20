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
  {
    type: TaskRequestType.PULL_FINGERPRINTS,
    title: "task.type.pullFingerprints",
  },
  {
    type: TaskRequestType.PUSH_FINGERPRINTS,
    title: "task.type.pushFingerprints",
  },
  {
    type: TaskRequestType.MATCH_REMOTE_FINGERPRINTS,
    title: "task.type.matchRemote",
  },
  {
    type: TaskRequestType.PREPARE_SEMANTIC_SEARCH,
    title: "task.type.prepareSemanticSearch",
  },
  {
    type: TaskRequestType.GENERATE_TILES,
    title: "task.type.generateTiles",
  },
];

export default TaskViewDescriptors;
