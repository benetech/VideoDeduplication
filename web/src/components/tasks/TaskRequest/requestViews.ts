import ProcessDirectoryRequestAttrs from "./task-types/ProcessDirectoryRequestAttrs";
import RawRequest from "./RawRequest";
import MatchTemplatesRequestAttrs from "./task-types/MatchTemplatesRequestAttrs";
import FindFrameRequestAttrs from "./task-types/FindFrameRequestAttrs";
import FindFrameRequestOverview from "./task-types/FindFrameRequestOverview";
import ProcessOnlineVideoRequestAttrs from "./task-types/ProcessOnlineVideoRequestAttrs";
import { TaskRequestType } from "../../../model/Task";
import { RequestViewMap } from "./model";

export const RequestViews: RequestViewMap = {
  [TaskRequestType.DIRECTORY]: [
    {
      title: "view.attributes",
      component: ProcessDirectoryRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestType.FILE_LIST]: [
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestType.MATCH_TEMPLATES]: [
    {
      title: "view.attributes",
      component: MatchTemplatesRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestType.FIND_FRAME]: [
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
  [TaskRequestType.PROCESS_ONLINE_VIDEO]: [
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
