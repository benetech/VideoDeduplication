import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SceneType from "../../../prop-types/SceneType";
import SceneList from "./SceneList";
import Scene from "./Scene";
import { useIntl } from "react-intl";
import CollapseButton from "../../../../common/components/CollapseButton";
import Collapse from "@material-ui/core/Collapse";
import BlurSwitch from "./BlurSwitch";

const useStyles = makeStyles((theme) => ({
  sceneSelector: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    flexGrow: 1,
  },
  collapseButton: {
    flexGrow: 0,
    marginLeft: theme.spacing(3),
  },
  scenes: {
    marginTop: theme.spacing(2),
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
  const { scenes, played, onSelect, collapsible, className } = props;
  const classes = useStyles();
  const selected = selectedScene(scenes, played);
  const messages = useMessages();
  const [collapsed, setCollapsed] = useState(false);
  const [blur, setBlur] = useState(true);

  const handleCollapse = useCallback(() => setCollapsed(!collapsed), [
    collapsed,
  ]);

  return (
    <div className={clsx(classes.sceneSelector, className)}>
      <div className={classes.header}>
        <div className={classes.title}>
          {scenes.length} {messages.scenes}
        </div>
        <BlurSwitch blur={blur} onBlurChange={setBlur} />
        {collapsible && (
          <CollapseButton
            className={classes.collapseButton}
            collapsed={collapsed}
            onClick={handleCollapse}
            size="small"
          />
        )}
      </div>
      <Collapse in={!collapsed}>
        <SceneList className={classes.scenes}>
          {scenes.map((scene, index) => (
            <Scene
              scene={scene}
              onSelect={onSelect}
              selected={index === selected}
              className={classes.scene}
              key={scene.position}
              blur={blur}
            />
          ))}
        </SceneList>
      </Collapse>
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
  /**
   * Enable or disable pane collapse feature.
   */
  collapsible: PropTypes.bool,
  className: PropTypes.string,
};

export default SceneSelector;
