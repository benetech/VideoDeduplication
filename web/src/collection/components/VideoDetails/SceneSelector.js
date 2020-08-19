import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SceneType from "./SceneType";
import SceneList from "./SceneList";
import Scene from "./Scene";

const useStyles = makeStyles((theme) => ({
  sceneSelector: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
  scenes: {
    marginBottom: theme.spacing(1),
  },
  scene: {
    cursor: "pointer",
  },
}));

function SceneSelector(props) {
  const { scenes, onSelect, className } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.sceneSelector, className)}>
      <div className={classes.title}>{scenes.length} Scenes</div>
      <SceneList className={classes.scenes}>
        {scenes.map((scene) => (
          <Scene
            scene={scene}
            onSelect={onSelect}
            className={classes.scene}
            key={scene.position}
          />
        ))}
      </SceneList>
    </div>
  );
}

SceneSelector.propTypes = {
  onSelect: PropTypes.func,
  scenes: PropTypes.arrayOf(SceneType).isRequired,
  className: PropTypes.string,
};

export default SceneSelector;
