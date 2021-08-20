import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  actions: ({ anchorOrigin }) => ({
    position: "absolute",
    [anchorOrigin.vertical]: theme.spacing(2),
    [anchorOrigin.horizontal]: theme.spacing(2),
    display: "flex",
    color: theme.palette.common.white,
  }),
}));

function VideoPlayerActions(props) {
  const {
    anchorOrigin: anchorOriginProp,
    children,
    className,
    ...other
  } = props;
  const anchorOrigin = Object.assign(
    { vertical: "top", horizontal: "right" },
    anchorOriginProp
  );
  const classes = useStyles({ anchorOrigin });
  return (
    <div className={clsx(classes.actions, className)} {...other}>
      {children}
    </div>
  );
}

VideoPlayerActions.propTypes = {
  /**
   * Actions position.
   */
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.oneOf(["top", "bottom"]),
    horizontal: PropTypes.oneOf(["left", "right"]),
  }),
  /**
   * Video Player Actions
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default VideoPlayerActions;
