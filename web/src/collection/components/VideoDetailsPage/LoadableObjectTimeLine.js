import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../prop-types/FileType";
import useLoadObjects from "./useLoadObjects";
import { useServer } from "../../../server-api/context";
import { LinearProgress } from "@material-ui/core";
import ObjectTimeLine from "./ObjectTimeLine";

const useStyles = makeStyles((theme) => ({}));

function LoadableObjectTimeLine(props) {
  const { file, onJump, className, ...other } = props;
  const classes = useStyles();
  const server = useServer();

  // Load objects
  const { objects, progress, total, done } = useLoadObjects({
    server,
    filters: { fileId: file.id },
    fields: ["template"],
  });

  const variant = total == null ? "indeterminate" : "determinate";

  if (!done) {
    return (
      <div className={clsx(className)} {...other}>
        <LinearProgress variant={variant} value={progress} />
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
