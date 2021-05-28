import React from "react";
import PropTypes from "prop-types";
import useFile from "../../../../hooks/useFile";
import FrameView from "../../../FrameView/FrameView";

function FindFrameRequestOverview(props) {
  const { request, className, ...other } = props;
  const { file } = useFile(request.fileId);

  if (file == null) {
    return null;
  }

  return (
    <FrameView
      file={file}
      timeMillis={request.frameTimeSec * 1000}
      className={className}
      {...other}
    />
  );
}

FindFrameRequestOverview.propTypes = {
  /**
   * Find-Frame Request to be displayed.
   */
  request: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default FindFrameRequestOverview;
