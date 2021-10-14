import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { VideoFile } from "../../../model/VideoFile";
import Paper from "@material-ui/core/Paper";
import FileTooltip from "./tooltip/FileTooltip";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    padding: theme.spacing(1),
  },
}));

function NodeTooltip(props: NodeTooltipProps): JSX.Element {
  const { file, className, ...other } = props;
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      <FileTooltip file={file} />
    </Paper>
  );
}

type NodeTooltipProps = {
  /**
   * File to be summarized.
   */
  file: VideoFile;
  className?: string;
  style?: React.CSSProperties;
};
export default NodeTooltip;
