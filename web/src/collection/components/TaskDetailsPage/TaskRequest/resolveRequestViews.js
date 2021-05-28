import TaskRequest from "../../../state/tasks/TaskRequest";
import ProcessDirectoryRequestAttrs from "./task-types/ProcessDirectoryRequestAttrs";
import RawRequest from "./RawRequest";
import MatchTemplatesRequestAttrs from "./task-types/MatchTemplatesRequestAttrs";
import FindFrameRequestAttrs from "./task-types/FindFrameRequestAttrs";
import FindFrameRequestOverview from "./task-types/FindFrameRequestOverview";

const RequestViews = {
  [TaskRequest.DIRECTORY]: [
    {
      title: "view.attributes",
      component: ProcessDirectoryRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequest.MATCH_TEMPLATES]: [
    {
      title: "view.attributes",
      component: MatchTemplatesRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequest.FIND_FRAME]: [
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
};

/**
 * Get views appropriate to display the given request.
 */
export default function resolveRequestViews(request) {
  const views = RequestViews[request.type];
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
