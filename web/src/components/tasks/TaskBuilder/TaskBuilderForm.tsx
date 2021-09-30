import React from "react";
import { TaskRequestType } from "../../../model/Task";
import { TaskBuilderProps } from "./model";
import ProcessDirectoryForm from "./forms/ProcessDirectoryForm";
import MatchTemplatesForm from "./forms/MatchTemplatesForm";
import ProcessOnlineVideoForm from "./forms/ProcessOnlineVideoForm";

function TaskBuilderForm(props: TaskBuilderProps): JSX.Element | null {
  const { request } = props;
  switch (request.type) {
    case TaskRequestType.DIRECTORY:
      return <ProcessDirectoryForm {...props} request={request} />;
    case TaskRequestType.MATCH_TEMPLATES:
      return <MatchTemplatesForm {...props} request={request} />;
    case TaskRequestType.PROCESS_ONLINE_VIDEO:
      return <ProcessOnlineVideoForm {...props} request={request} />;
    default:
      return null;
  }
}

export default TaskBuilderForm;
