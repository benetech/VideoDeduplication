import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "../../basic/Button";
import { Tooltip } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
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

function VideoPlayerAction(props) {
  const { title, tooltip, icon: Icon, handler, className, ...other } = props;
  const classes = useStyles();

  // Make icon element
  let icon = null;
  if (Icon != null) {
    icon = <Icon />;
  }

  // Make button element
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
  );

  // Add tooltip if provided
  if (tooltip?.length > 0) {
    return (
      <Tooltip title={tooltip} classes={{ tooltip: classes.tooltip }}>
        {button}
      </Tooltip>
    );
  }

  return button;
}

VideoPlayerAction.propTypes = {
  /**
   * Action title.
   */
  title: PropTypes.string,
  /**
   * Action handler.
   */
  handler: PropTypes.func.isRequired,
  /**
   * Action tooltip.
   */
  tooltip: PropTypes.string,
  /**
   * Icon to be displayed.
   */
  icon: PropTypes.elementType,
  className: PropTypes.string,
};

export default VideoPlayerAction;
