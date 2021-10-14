import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { AnchorOrigin } from "../../../model/AnchorOrigin";

type VideoPlayerActionsStyleProps = {
  anchorOrigin: AnchorOrigin;
};

const useStyles = makeStyles<Theme, VideoPlayerActionsStyleProps>((theme) => ({
  actions: ({ anchorOrigin }) => ({
    position: "absolute",
    [anchorOrigin.vertical || "top"]: theme.spacing(2),
    [anchorOrigin.horizontal || "right"]: theme.spacing(2),
    display: "flex",
    color: theme.palette.common.white,
  }),
}));

function VideoPlayerActions(props: VideoPlayerActionsProps): JSX.Element {
  const {
    anchorOrigin: anchorOriginProp,
    children,
    className,
    ...other
  } = props;
  const anchorOrigin = Object.assign(
    {
      vertical: "top",
      horizontal: "right",
    },
    anchorOriginProp
  );
  const classes = useStyles({
    anchorOrigin,
  });
  return (
    <div className={clsx(classes.actions, className)} {...other}>
      {children}
    </div>
  );
}

type VideoPlayerActionsProps = {
  /**
   * Actions position.
   */
  anchorOrigin?: AnchorOrigin;

  /**
   * Video Player Actions
   */
  children?: React.ReactNode;
  className?: string;
};
export default VideoPlayerActions;
