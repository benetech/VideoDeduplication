import TaskRequestTypes from "../../../prop-types/TaskRequestTypes";
import RawResults from "./RawResults";
import FindFrameResultsOverview from "./task-types/FindFrameResultsOverview";
import ProcessOnlineVideoResultsOverview from "./task-types/ProcessOnlineVideoResultsOverview";

const RequestViews = {
  [TaskRequestTypes.FIND_FRAME]: [
    {
      title: "view.overview",
      component: FindFrameResultsOverview,
    },
    {
      title: "view.raw",
      component: RawResults,
    },
  ],
  [TaskRequestTypes.PROCESS_ONLINE_VIDEO]: [
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

/**
 * Get views appropriate to display the given task results.
 */
export default function resolveResultViews(task) {
  const views = RequestViews[task.request.type];
  if (views != null && views.length > 0) {
    return views;
  }
  return [
    {
      title: "view.raw",
      component: RawResults,
    },
  ];
}
