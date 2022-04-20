import React from "react";
import { TaskRequestType } from "../../../model/Task";
import { TaskBuilderProps } from "./model";
import ProcessDirectoryForm from "./forms/ProcessDirectoryForm";
import MatchTemplatesForm from "./forms/MatchTemplatesForm";
import ProcessOnlineVideoForm from "./forms/ProcessOnlineVideoForm";
import PullFingerprints from "./forms/PullFingerprints";
import PushFingerprints from "./forms/PushFingerprints";
import MatchRemoteFingerprints from "./forms/MatchRemoteFingerprints";
import PrepareSemanticSearch from "./forms/PrepareSemanticSearch";
import GenerateTiles from "./forms/GenerateTiles";

function TaskBuilderForm(props: TaskBuilderProps): JSX.Element | null {
  const { request } = props;
  switch (request.type) {
    case TaskRequestType.DIRECTORY:
      return <ProcessDirectoryForm {...props} request={request} />;
    case TaskRequestType.MATCH_TEMPLATES:
      return <MatchTemplatesForm {...props} request={request} />;
    case TaskRequestType.PROCESS_ONLINE_VIDEO:
      return <ProcessOnlineVideoForm {...props} request={request} />;
    case TaskRequestType.PULL_FINGERPRINTS:
      return <PullFingerprints {...props} request={request} />;
    case TaskRequestType.PUSH_FINGERPRINTS:
      return <PushFingerprints {...props} request={request} />;
    case TaskRequestType.MATCH_REMOTE_FINGERPRINTS:
      return <MatchRemoteFingerprints {...props} request={request} />;
    case TaskRequestType.PREPARE_SEMANTIC_SEARCH:
      return <PrepareSemanticSearch {...props} request={request} />;
    case TaskRequestType.GENERATE_TILES:
      return <GenerateTiles {...props} request={request} />;
    default:
      return null;
  }
}

export default TaskBuilderForm;
