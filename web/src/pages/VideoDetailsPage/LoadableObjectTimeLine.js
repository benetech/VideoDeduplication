import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { FileType } from "../../prop-types/FileType";
import { LinearProgress } from "@material-ui/core";
import ObjectTimeLine from "./ObjectTimeLine";
import useObjectsAll from "../../application/api/objects/useObjectsAll";

function LoadableObjectTimeLine(props) {
  const { file, onJump, className, ...other } = props;

  // Load objects
  const { objects, progress, done } = useObjectsAll({ fileId: file.id });
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
