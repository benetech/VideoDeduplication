import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { basename } from "../../../../lib/helpers/paths";
import CloudOutlinedIcon from "@material-ui/icons/CloudOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import { VideoFile } from "../../../../model/VideoFile";
import Partner from "./Partner";
import Duration from "./Duration";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  name: {
    ...theme.mixins.textEllipsis,
    ...theme.mixins.title5,
    flexGrow: 1,
    maxWidth: 300,
    marginRight: theme.spacing(1),
  },
  icon: {
    color: theme.palette.primary.contrastText,
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(3),
    height: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: theme.spacing(1),
  },
}));

function FileTooltip(props: FileTooltipProps): JSX.Element {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const name = file?.external ? file.hash : basename(file.filename);
  const Icon = file?.external ? CloudOutlinedIcon : VideocamOutlinedIcon;
  const Details = file?.external ? Partner : Duration;
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.iconContainer}>
        <Icon className={classes.icon} />
      </div>
      <div className={classes.name}>{name}</div>
      <Details file={file} />
    </div>
  );
}

type FileTooltipProps = {
  /**
   * File to be summarized.
   */
  file: VideoFile;
  className?: string;
};
export default FileTooltip;
