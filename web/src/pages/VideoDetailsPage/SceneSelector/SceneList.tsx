import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
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

function SceneList(props: SceneListProps): JSX.Element {
  const { children: scenes, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.scenesViewport, className)}>
      <div className={classes.scenes}>{scenes}</div>
    </div>
  );
}

type SceneListProps = {
  /**
   * Scene list.
   */
  children?: React.ReactNode;
  className?: string;
};
export default SceneList;
