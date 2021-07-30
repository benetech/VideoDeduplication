import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  /**
   * Limited viewport for scenes
   */
  scenesViewport: {
    minWidth: 0,
    overflowX: "scroll",
    "&::-webkit-scrollbar": {
      backgroundColor: theme.palette.common.white,
    },
  },
  /**
   * Linear sequence of scenes
   */
  scenes: {
    display: "flex",
  },
  /**
   * Single scene
   */
  scene: {
    flexShrink: 0,
  },
}));

function SceneList(props) {
  const { children: scenes, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.scenesViewport, className)}>
      <div className={classes.scenes}>{scenes}</div>
    </div>
  );
}

SceneList.propTypes = {
  /**
   * Scene list.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default SceneList;
