import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { FileType } from "../../prop-types/FileType";
import { LinearProgress } from "@material-ui/core";
import ObjectTimeLine from "./ObjectTimeLine";
import ObjectAPI from "../../application/api/objects/ObjectAPI";

function LoadableObjectTimeLine(props) {
  const { file, onJump, className, ...other } = props;

  // Load objects
  const objectsAPI = ObjectAPI.use();
  const { objects = [], progress, done } = objectsAPI.useFileObjects(file.id);
  const variant = progress == null ? "indeterminate" : "determinate";

  if (!done) {
    return (
      <div className={clsx(className)} {...other}>
        <LinearProgress variant={variant} value={progress * 100} />
      </div>
    );
  }

  return (
    <ObjectTimeLine
      file={file}
      objects={objects}
      onJump={onJump}
      className={className}
      {...other}
    />
  );
}

LoadableObjectTimeLine.propTypes = {
  /**
   * Video file metadata
   */
  file: FileType.isRequired,
  /**
   * Handle jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default LoadableObjectTimeLine;
