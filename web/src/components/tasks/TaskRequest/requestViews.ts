import ProcessDirectoryRequestAttrs from "./task-types/ProcessDirectoryRequestAttrs";
import RawRequest from "./RawRequest";
import MatchTemplatesRequestAttrs from "./task-types/MatchTemplatesRequestAttrs";
import FindFrameRequestAttrs from "./task-types/FindFrameRequestAttrs";
import FindFrameRequestOverview from "./task-types/FindFrameRequestOverview";
import ProcessOnlineVideoRequestAttrs from "./task-types/ProcessOnlineVideoRequestAttrs";
import { TaskRequestType } from "../../../model/Task";
import { RequestViewMap } from "./model";
import PrepareSemanticSearchRequestAttrs from "./task-types/PrepareSemanticSearchRequestAttrs";
import GenerateTilesRequestAttrs from "./task-types/GenerateTilesRequestAttrs";

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
  [TaskRequestType.PUSH_FINGERPRINTS]: [
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestType.PULL_FINGERPRINTS]: [
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestType.MATCH_REMOTE_FINGERPRINTS]: [
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestType.PREPARE_SEMANTIC_SEARCH]: [
    {
      title: "view.attributes",
      component: PrepareSemanticSearchRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
  [TaskRequestType.GENERATE_TILES]: [
    {
      title: "view.attributes",
      component: GenerateTilesRequestAttrs,
    },
    {
      title: "view.raw",
      component: RawRequest,
    },
  ],
};
