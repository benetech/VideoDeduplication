import React from "react";
import useFile from "../../../../application/api/files/useFile";
import FrameView from "../../../files/FrameView/FrameView";
import { FindFrameRequest } from "../../../../model/Task";
import { TaskRequestViewProps } from "../model";

function FindFrameRequestOverview(
  props: TaskRequestViewProps<FindFrameRequest>
): JSX.Element | null {
  const { task, className, ...other } = props;
  const request = task.request;
  const { file } = useFile(request.fileId);

  if (file == null) {
    return null;
  }

  return (
    <FrameView
      file={file}
      timeMillis={request.frameTimeMillis}
      className={className}
      {...other}
    />
  );
}

export default FindFrameRequestOverview;
