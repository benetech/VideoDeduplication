import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SceneType from "../SceneType";
import SceneList from "./SceneList";
import Scene from "./Scene";
import { useIntl } from "react-intl";

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

/**
 * Get index of the scene being played at the moment.
 */
function selectedScene(scenes, played) {
  let selected = -1;
  for (let [index, scene] of scenes.entries()) {
    if (scene.position <= played) {
      selected = index;
    } else {
      break;
    }
  }
  return selected;
}

function useMessages() {
  const intl = useIntl();
  return {
    scenes: intl.formatMessage({ id: "file.scenes" }),
  };
}

function SceneSelector(props) {
  const { scenes, played, onSelect, className } = props;
  const classes = useStyles();
  const selected = selectedScene(scenes, played);
  const messages = useMessages();

  return (
    <div className={clsx(classes.sceneSelector, className)}>
      <div className={classes.title}>
        {scenes.length} {messages.scenes}
      </div>
      <SceneList className={classes.scenes}>
        {scenes.map((scene, index) => (
          <Scene
            scene={scene}
            onSelect={onSelect}
            selected={index === selected}
            className={classes.scene}
            key={scene.position}
          />
        ))}
      </SceneList>
    </div>
  );
}

SceneSelector.propTypes = {
  /**
   * Fires when user click on a particular scene
   */
  onSelect: PropTypes.func,
  /**
   * Scenes in a vide
   */
  scenes: PropTypes.arrayOf(SceneType).isRequired,
  /**
   * Current playback position used to determine scene being displayed
   */
  played: PropTypes.number,
  className: PropTypes.string,
};

export default SceneSelector;
