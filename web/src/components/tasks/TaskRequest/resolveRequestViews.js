import TaskRequestTypes from "../../../prop-types/TaskRequestTypes";
import ProcessDirectoryRequestAttrs from "./task-types/ProcessDirectoryRequestAttrs";
import RawRequest from "./RawRequest";
import MatchTemplatesRequestAttrs from "./task-types/MatchTemplatesRequestAttrs";
import FindFrameRequestAttrs from "./task-types/FindFrameRequestAttrs";
import FindFrameRequestOverview from "./task-types/FindFrameRequestOverview";
import ProcessOnlineVideoRequestAttrs from "./task-types/ProcessOnlineVideoRequestAttrs";

const RequestViews = {
  [TaskRequestTypes.DIRECTORY]: [
    {
      title: "view.attributes",
      component: ProcessDirectoryRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestTypes.MATCH_TEMPLATES]: [
    {
      title: "view.attributes",
      component: MatchTemplatesRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestTypes.FIND_FRAME]: [
    {
      title: "view.overview",
      component: FindFrameRequestOverview,
    },
    {
      title: "view.attributes",
      component: FindFrameRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestTypes.PROCESS_ONLINE_VIDEO]: [
    {
      title: "view.attributes",
      component: ProcessOnlineVideoRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
};

/**
 * Get views appropriate to display the given request.
 */
export default function resolveRequestViews(task) {
  const views = RequestViews[task.request.type];
  if (views != null && views.length > 0) {
    return views;
  }
  return [
    {
      title: "view.raw",
      component: RawRequest,
    },
  ];
}
