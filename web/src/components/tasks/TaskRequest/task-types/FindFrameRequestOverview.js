import React from "react";
import PropTypes from "prop-types";
import useFile from "../../../../application/api/files/useFile";
import FrameView from "../../../files/FrameView/FrameView";
import TaskType from "../../../../prop-types/TaskType";

function FindFrameRequestOverview(props) {
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

FindFrameRequestOverview.propTypes = {
  /**
   * Task which request will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default FindFrameRequestOverview;
