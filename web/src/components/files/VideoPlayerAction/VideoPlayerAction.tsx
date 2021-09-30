import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme, Tooltip } from "@material-ui/core";
import Button from "../../basic/Button";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { SvgIconTypeMap } from "@material-ui/core/SvgIcon/SvgIcon";

const useStyles = makeStyles<Theme>((theme) => ({
  actionButton: {
    minWidth: 0,
    marginLeft: theme.spacing(0.5),
    backgroundColor: "rgba(5,5,5,0.4)",
    "&:hover": {
      backgroundColor: "rgba(5,5,5,0.3)",
    },
  },
  tooltip: {
    color: theme.palette.common.white,
    backgroundColor: "rgba(5,5,5,0.4)",
  },
}));

function VideoPlayerAction(props: VideoPlayerActionProps): JSX.Element {
  const { title, tooltip, icon: Icon, handler, className, ...other } = props;
  const classes = useStyles(); // Make icon element

  let icon: JSX.Element | null = null;

  if (Icon != null) {
    icon = <Icon />;
  } // Make button element

  const button = (
    <Button
      color="inherit"
      className={clsx(classes.actionButton, className)}
      onClick={handler}
      {...other}
    >
      {icon}
      <span>{title}</span>
    </Button>
  ); // Add tooltip if provided

  if (tooltip != null && tooltip.length > 0) {
    return (
      <Tooltip
        title={tooltip}
        classes={{
          tooltip: classes.tooltip,
        }}
      >
        {button}
      </Tooltip>
    );
  }

  return button;
}

type VideoPlayerActionProps = {
  /**
   * Action title.
   */
  title?: string;

  /**
   * Action handler.
   */
  handler: (...args: any[]) => void;

  /**
   * Action tooltip.
   */
  tooltip?: string;

  /**
   * Icon to be displayed.
   */
  icon?: OverridableComponent<SvgIconTypeMap>;
  className?: string;
};
export default VideoPlayerAction;
