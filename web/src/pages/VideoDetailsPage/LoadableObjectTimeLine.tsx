import React from "react";
import clsx from "clsx";
import { VideoFile } from "../../model/VideoFile";
import { LinearProgress } from "@material-ui/core";
import ObjectTimeLine from "./ObjectTimeLine";
import useObjectsAll from "../../application/api/objects/useObjectsAll";
import { TemplateMatch } from "../../model/Template";

function LoadableObjectTimeLine(
  props: LoadableObjectTimeLineProps
): JSX.Element {
  const { file, onSelect, className, ...other } = props; // Load objects

  const { objects, progress, done } = useObjectsAll({
    fileId: file.id,
  });
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
      onSelect={onSelect}
      className={className}
      {...other}
    />
  );
}

type LoadableObjectTimeLineProps = {
  /**
   * Video file metadata
   */
  file: VideoFile;

  /**
   * Handle jump to a particular object
   */
  onSelect?: (object: TemplateMatch) => void;
  className?: string;
};
export default LoadableObjectTimeLine;
