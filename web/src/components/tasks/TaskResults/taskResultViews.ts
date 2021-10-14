import RawResults from "./RawResults";
import FindFrameResultsOverview from "./task-types/FindFrameResultsOverview";
import ProcessOnlineVideoResultsOverview from "./task-types/ProcessOnlineVideoResultsOverview";
import MatchTemplatesResultsOverview from "./task-types/MatchTemplatesResultsOverview";
import { TaskResultViewMap } from "./model";
import { TaskRequestType } from "../../../model/Task";

export const TaskResultViews: TaskResultViewMap = {
  [TaskRequestType.DIRECTORY]: [
    {
      title: "view.raw",
      component: RawResults,
    },
  ],
  [TaskRequestType.FILE_LIST]: [
    {
      title: "view.raw",
      component: RawResults,
    },
  ],
  [TaskRequestType.MATCH_TEMPLATES]: [
    {
      title: "view.overview",
      component: MatchTemplatesResultsOverview,
    },
    {
      title: "view.raw",
      component: RawResults,
    },
  ],
  [TaskRequestType.FIND_FRAME]: [
    {
      title: "view.overview",
      component: FindFrameResultsOverview,
    },
    {
      title: "view.raw",
      component: RawResults,
    },
  ],
  [TaskRequestType.PROCESS_ONLINE_VIDEO]: [
    {
      title: "view.overview",
      component: ProcessOnlineVideoResultsOverview,
    },
    {
      title: "view.raw",
      component: RawResults,
    },
  ],
};
